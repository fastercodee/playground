export function setupCounter(element: HTMLButtonElement) {
  // eslint-disable-next-line functional/no-let
  let counter = 0
  const setCounter = (count: number) => {
    counter = count
    element.innerHTML = `count is ${counter}`
  }
  element.addEventListener("click", () => setCounter(counter + 1))
  setCounter(0)
}
