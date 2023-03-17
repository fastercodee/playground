declare module "*?serviceworker" {
  const fn: () => Promise<ServiceWorkerRegistration>

  export default fn
}
