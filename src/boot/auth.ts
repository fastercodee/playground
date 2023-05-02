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
      keyUser: "user",
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
    redirect_uri: `${process.env.APP_URL}login?oauth2=true&type=google`,
    response_type: "id_token",
    scope: "email profile openid",
    nonce: "1",
  }

  window.open(oauth2Endpoint + "?" + new URLSearchParams(params).toString(), '_self')
}

export function loginWithGithub() {
  const oauth2Endpoint = "https://github.com/login/oauth/authorize"

  // Parameters to pass to OAuth 2.0 endpoint.
  const params = {
    client_id: process.env.OAUTH2_GITHUB_CLIENT_ID,
    redirect_uri: `${process.env.APP_URL}login?oauth2=true&type=github`,
    scope: "read:user user:email",
  }

  window.open(oauth2Endpoint + "?" + new URLSearchParams(params).toString(), '_self')
}

Object.assign(window, {
  loginWithGoogle,
  loginWithGithub
})

export const OAuth2_SUPPORTS = ["google", "github"]
