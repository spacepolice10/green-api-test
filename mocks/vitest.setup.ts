import { afterAll, afterEach, beforeAll } from "vitest"
import { resetDb } from "./db.ts"
import { server } from "./node.ts"

const localMemory = new Map<string, string>()
const sessionMemory = new Map<string, string>()

function storage(memory: Map<string, string>) {
  return {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => {
      memory.set(key, value)
    },
    removeItem: (key: string) => {
      memory.delete(key)
    },
    clear: () => {
      memory.clear()
    },
  }
}

Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: storage(localMemory),
})

Object.defineProperty(globalThis, "sessionStorage", {
  configurable: true,
  value: storage(sessionMemory),
})

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" })
})

afterEach(() => {
  localMemory.clear()
  sessionMemory.clear()
  resetDb()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})
