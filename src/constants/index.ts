export const isNative =
  import.meta.env.MODE === "android" ||
  import.meta.env.MODE === "ios" ||
  import.meta.env.MODE === "electron"

export const APP_URL = process.env.GITPOD_WORKSPACE_URL
  ? (process.env.GITPOD_WORKSPACE_URL.replace("https://", "https://9000-") + "/")
  : process.env.CODESPACE_NAME
    ? `${process.env.CODESPACE_NAME}-9000.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}/`

    : process.env.API_URL
