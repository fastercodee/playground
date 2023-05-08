import { AxiosError } from "axios"

export function useNotify() {
  const $q = useQuasar()

  function error(err: unknown) {
    $q.notify({
      position: "bottom-right",
      type: "negative",
      group: false,
      message:
        (err as AxiosError<any> | undefined)?.response?.data?.message ??
        (err as Error | undefined)?.message,
    })
  }
  function success(message: string) {
    $q.notify({
      position: "bottom-right",
      type: "positive",
      group: false,
      message,
    })
  }

  return { error, success }
}
