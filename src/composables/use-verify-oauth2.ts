/* eslint-disable camelcase */
import { AxiosError } from "axios"
import { OAuth2_SUPPORTS } from "boot/auth"

export function useVerifyOAuth2() {
  const route = useRoute()
  const router = useRouter()
  const auth = useAuth()

  const id_token = computed(() => {
    if (route.query.type === "google") {
      return route.query.id_token ?? new URLSearchParams(route.hash.slice(1)).get("id_token")
    }
    if (route.query.type === "github")
      return route.query.code
  })

  const verifyOAuth2 = computed(() => {
    if (route.query.oauth2 !== "true") return false;
    if (typeof route.query.type !== "string") return false

    if (!OAuth2_SUPPORTS.includes(route.query.type.toLowerCase())) return false;

    if (!id_token.value) return false;

    return true;
  })

  async function loginWithOauth2(username?: string) {
    const type = route.query.type

    try {
      return await auth.login({
        url: "/auth/oauth2",
        data: {
          type,
          id_token: id_token.value,
          username
        }
      })
    } catch (err) {
      console.log(err)
      const code: string | undefined = (err as AxiosError<any> | undefined)?.response?.data?.code
      if (code === "username_required") {
        // question scan username
        await router.push({
          path: "/signup",
          query: {
            type,
            id_token: id_token.value,
            oauth2: "true"
          }
        })
        return
      }
      if (code === "token_invalid") {
        router.replace({
          path: route.path,
        })
      }

      throw err
    }
  }

  return {
    verifyOAuth2, loginWithOauth2
  }
}
