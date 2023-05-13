export function validateSketchName(val: string) {
  return /^[^\\/:*?"<>|]{1,50}$/.test(val) || "Sketch name invalid."
}
