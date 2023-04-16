
export const isNative =
  import.meta.env.MODE === "android" ||
  import.meta.env.MODE === "ios" ||
  import.meta.env.MODE === "electron"