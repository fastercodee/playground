import { boot } from "quasar/wrappers";
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
      }
    },

    plugins: {
      router
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
