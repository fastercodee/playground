
import type {
  _getListLink,
  callFnLink,
  readLinkObject
} from "vue-console-feed/encode"

export type ComPreviewVue = {
  _getListLink: typeof _getListLink,
  readLinkObject: typeof readLinkObject
  callFnLink: typeof callFnLink

  clear(): void
}
