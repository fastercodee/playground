import type {
  _getListLink,
  callFnLink,
  readLinkObject,
} from "vue-console-feed/encode"

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type ComPreviewVue = {
  _getListLink: typeof _getListLink
  readLinkObject: typeof readLinkObject
  callFnLink: typeof callFnLink

  clear(): void

  reload(): void
  back(): void
  forward(): void
}
