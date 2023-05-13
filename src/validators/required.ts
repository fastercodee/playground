export function validateRequired(v: string) {
  return v.trim() ? true : "Required"
}
