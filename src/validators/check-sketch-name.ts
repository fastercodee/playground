import { AxiosError } from "axios"
import { Sketch } from "src/types/api/Models/Sketch"
import { Auth } from "vue-auth3"

export async function checkSketchName(
  value: string,
  auth: Auth,
  sketchInfo?: Sketch<true, false> | null
) {
  if (sketchInfo === undefined) return
  if (sketchInfo?.name === name) return true

  try {
    await auth.http({
      url: "/sketch/check_name",
      method: "POST",
      data: {
        uid: sketchInfo?.uid,
        name: value,
      },
    })

    return true
  } catch (err) {
    return (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (err as AxiosError<any>)?.response?.data?.errors?.name?.[0] ??
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (err as AxiosError<any>)?.response?.data?.message
    )
  }
}
