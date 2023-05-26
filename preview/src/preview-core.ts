import regiser from "./sw?serviceworker"

// eslint-disable-next-line promise/catch-or-return
regiser().then(() => (location as Location).reload())

document.body.textContent = "Initialize service preview"
