import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios"
import axios from "axios"
import { boot } from "quasar/wrappers"
import type { Control } from "src/types/api/Controller/SketchController"

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $axios: AxiosInstance
  }
}

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const api = axios.create({ baseURL: process.env.API_URL })

export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
})

export { api }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function post<C extends Control<any, any>>(
  url: string,
  data?: C["body"],
  config?: AxiosRequestConfig<C["body"]>
) {
  return api.post<undefined, AxiosResponse<C["response"]>, C["body"]>(
    url,
    data,
    config
  )
}
