/// <reference types="@types/serviceworker" />
var fCom = (function (exports) {
  'use strict';

  var __defProp = Object.defineProperty;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // src/logic/uuid.ts
  var uuid = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID.bind(crypto) : () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === "x" ? r : r & 3 | 8;
        return v.toString(16);
      }
    );
  };

  // src/communicate/listen.ts
  var storeListen = /* @__PURE__ */ new WeakMap();
  function listen(port, name, listener, options) {
    function handler(event) {
      return __async(this, null, function* () {
        const { data } = event;
        if (typeof data !== "object")
          return;
        if (data.type === "call_fn" && data.name === name) {
          if (data.ping) {
            listener(...data.args);
            return;
          }
          let result;
          let err;
          try {
            const r = yield listener(...data.args);
            if (r && typeof r === "object" && "return" in r) {
              result = r;
            } else {
              result = {
                return: r
              };
            }
          } catch (error) {
            if (options == null ? void 0 : options.debug)
              console.warn(error);
            err = error + "";
          }
          const message = __spreadValues({
            id: data.id,
            type: "return_fn",
            name: data.name
          }, result ? {
            retu: result.return,
            isOk: true
          } : {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            retu: err,
            isOk: false
          });
          port.postMessage(message, result);
          if (options == null ? void 0 : options.once)
            stop();
        }
      });
    }
    let conf = storeListen.get(port);
    if (!conf) {
      const cbs = /* @__PURE__ */ new Set();
      cbs.add(handler);
      storeListen.set(
        port,
        conf = {
          handle(event) {
            cbs.forEach((cb) => cb(event));
          },
          cbs
        }
      );
      port.addEventListener("message", conf.handle);
    } else {
      conf.cbs.add(handler);
    }
    function stop() {
      const conf2 = storeListen.get(port);
      if (!conf2)
        return;
      conf2.cbs.delete(handler);
      if (conf2.cbs.size === 0) {
        port.removeEventListener("message", conf2.handle);
        storeListen.delete(port);
      }
    }
    return stop;
  }

  // src/communicate/pit.ts
  function pit(port, options, ...args) {
    let name;
    if (typeof options === "object")
      name = options.name;
    else
      name = options;
    const message = {
      id: "0",
      type: "call_fn",
      name,
      args,
      ping: true
    };
    port.postMessage(message, typeof options === "object" ? options : void 0);
  }

  // src/communicate/put.ts
  var storePut = /* @__PURE__ */ new WeakMap();
  function put(port, options, ...args) {
    return new Promise((resolve, reject) => {
      var _a;
      const id = uuid();
      let name;
      let timeout = 3e4;
      let signal;
      if (typeof options === "object") {
        name = options.name;
        timeout = (_a = options.timeout) != null ? _a : 3e4;
        signal = options.signal;
      } else {
        name = options;
      }
      if (signal == null ? void 0 : signal.aborted) {
        reject(new Error("aborted"));
        return;
      }
      function handler(event) {
        const { data } = event;
        if (typeof data !== "object")
          return;
        if (data.type === "return_fn" && data.id === id && data.name === name) {
          if (data.isOk)
            resolve(data.retu);
          else
            reject(new Error(data.retu));
          stop();
        }
      }
      const timeoutId = setTimeout(() => {
        stop();
        reject(new Error("timeout"));
      }, timeout);
      function onAbort() {
        stop();
        reject(new Error("aborted"));
      }
      let conf = storePut.get(port);
      if (!conf) {
        const cbs = /* @__PURE__ */ new Set();
        cbs.add(handler);
        storePut.set(
          port,
          conf = {
            handle(event) {
              cbs.forEach((cb) => cb(event));
            },
            cbs
          }
        );
        port.addEventListener("message", conf.handle);
      } else {
        conf.cbs.add(handler);
      }
      signal == null ? void 0 : signal.addEventListener("abort", onAbort);
      function stop() {
        clearTimeout(timeoutId);
        signal == null ? void 0 : signal.removeEventListener("abort", onAbort);
        const conf2 = storePut.get(port);
        if (!conf2)
          return;
        conf2.cbs.delete(handler);
        if (conf2.cbs.size === 0) {
          port.removeEventListener("message", conf2.handle);
          storePut.delete(port);
        }
      }
      const message = {
        id,
        type: "call_fn",
        name,
        args
      };
      port.postMessage(message, typeof options === "object" ? options : void 0);
    });
  }

  exports.listen = listen;
  exports.ping = pit;
  exports.pit = pit;
  exports.put = put;
  exports.uuid = uuid;

  return exports;

})({});
// export { c as listen, i as ping, i as pit, d as put, a as uuid }
// export default null

// self.addEventListener("install", (event) => {
//   self.skipWaiting()
// })

// self.addEventListener("activate", (event) => {
//   event.waitUntil(clients.claim())
// })

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
// export type Communicate = {
//   "get file": (opts: {
//     url: string
//     headers: [string, string][]
//   }) => Promise<null | {
//     content: ArrayBuffer
//     init: ResponseInit
//   }>
// }

const { put } = fCom
const cast = new BroadcastChannel("sw-fetch")

addEventListener("fetch", (event) => {
  console.log({ event })
  const request = event.request
  const url = new URL(request.url)

  if (
    request.method.toLowerCase() === "get" &&
    url.origin === location.origin &&
    (url.pathname !== "/") &&
    !url.pathname.startsWith("/@vite/") &&
    !url.pathname.startsWith("/node_modules/") &&
    /^https?:$/g.test(url.protocol)
  ) {
    console.log("send request")

    const response = put(cast, "get file", {
      url: request.url,
      headers: [...request.headers.entries()],
    }).then(response => response ? new Response(response.content, response.init) : fetch(event.request))

      event.respondWith(response)
      return

  }

  event.respondWith(fetch(event.request))
})
