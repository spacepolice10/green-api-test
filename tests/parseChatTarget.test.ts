import { expect, test } from "vitest"
import { parseChatTarget } from "../src/chat/create-chat/parseChatTarget.ts"

test("parses a phone number into a phoneNumber query", async () => {
  await expect(parseChatTarget("+7 (999) 123-45-67")).resolves.toEqual({
    phoneNumber: "79991234567",
  })
})

test("adds @ when the username was typed without it", async () => {
  await expect(parseChatTarget("durov")).resolves.toEqual({
    username: "@durov",
  })
})

test("keeps a username that already starts with @", async () => {
  await expect(parseChatTarget("@durov")).resolves.toEqual({
    username: "@durov",
  })
})

test("rejects a username that is too short", async () => {
  await expect(parseChatTarget("@ab")).resolves.toBeNull()
})

test("rejects a phone number that is too short", async () => {
  await expect(parseChatTarget("123")).resolves.toBeNull()
})
