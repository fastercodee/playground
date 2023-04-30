import { boot } from "quasar/wrappers";
import { createAuth } from "vue-auth3"
import authDriver from "vue-auth3/drivers/auth/bearer"

import { api } from "./axios"

export const auth = createAuth({
  drivers: {
    auth: authDriver,
    http: {
      request: api,
    }
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

export default boot(({ app }) => {
  app.use(auth)
})
