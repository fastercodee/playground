import { boot } from "quasar/wrappers"
import { createAuth } from "vue-auth3"
import authDriver from "vue-auth3/drivers/auth/bearer"

import { api } from "./axios"

export default boot(({ app, router }) => {
  const auth = createAuth({
    cookie: {
      path: "/",
      secure: true,
      expires: 12096e5,
      sameSite: "None",
    },

    drivers: {
      auth: authDriver,
      http: {
        request: api,
      },
    },

    plugins: {
      router,
    },

    registerData: {
      staySignedIn: true,
    },
    fetchData: {
      enabled: true, // send a request to `/api/user` if the user information stored in the cookie is not visible
      cache: "default", // save user information to localStorage for use
      enabledInBackground: true, // refresh user information in the background
    },
    loginData: {
      fetchUser: false,
    },
    refreshToken: {
      enabled: false, // refresh token in goto page
      enabledInBackground: false, // refresh token in background
    },
  })

  app.use(auth)
})

export function loginWithGoogle() {
  const oauth2Endpoint = "https://accounts.google.com/o/oauth2/v2/auth"

  // Parameters to pass to OAuth 2.0 endpoint.
  const params = {
    client_id: process.env.OAUTH2_GOOGLE_CLIENT_ID,
    redirect_uri: "http://localhost:8000",
    response_type: "id_token",
    scope: "email profile openid",
    include_granted_scopes: "true",
    state: "pass-through value",
    nonce: "1",
  }

  window.open(oauth2Endpoint + "?" + new URLSearchParams(params).toString())
}

export function loginWithGithub() {
  const oauth2Endpoint = "https://github.com/login/oauth/authorize"

  // Parameters to pass to OAuth 2.0 endpoint.
  const params = {
    client_id: process.env.OAUTH2_GITHUB_CLIENT_ID,
    redirect_uri: "http://localhost:8000",
    scope: "read:user user:email",
  }

  window.open(oauth2Endpoint + "?" + new URLSearchParams(params).toString())
}