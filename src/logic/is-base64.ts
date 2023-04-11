const base64regex =
  /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/

export function isBase64(str: string) {
  if (base64regex.test(str)) {
    try {
      return btoa(atob(str)) === str
    } catch (err) {
      return false
    }
  }

  return false
}

// bar4
