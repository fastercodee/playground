declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string
    VUE_ROUTER_MODE: "hash" | "history" | "abstract" | undefined
    VUE_ROUTER_BASE: string | undefined
    API_URL: string
		OAUTH2_GOOGLE_CLIENT_ID: string
    OAUTH2_GITHUB_CLIENT_ID: string
  }
}
