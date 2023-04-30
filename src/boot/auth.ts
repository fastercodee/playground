import { boot } from "quasar/wrappers";
import { createAuth } from "vue-auth3"
import authDriver from "vue-auth3/drivers/auth/bearer"

import { api } from "./axios"

export default boot(({ app, router }) => {
  const auth = createAuth({
    drivers: {
      auth: authDriver,
      http: {
        request: api,
      }
    },

    plugins: {
      router
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
      enabledInBackground: true, // refresh token in background
    },
  })

  app.use(auth)
})
