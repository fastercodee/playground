import "./style.css"

import { listen } from "@fcanvas/communicate"

const { port1, port2 } = new MessageChannel()

iframe.onload = () =>  {
iframe.contentWindow.postMessage({ port2 }, { transfer: [port2], targetOrigin: "*" })

port1.start()
listen(port1, "get file", (opts) => {
  console.log({ opts })
})
}
