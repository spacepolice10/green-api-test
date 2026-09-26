import { worker } from "./browser.ts"

await worker.start({
  onUnhandledRequest: "bypass",
  serviceWorker: { url: "/mockServiceWorker.js" },
})
