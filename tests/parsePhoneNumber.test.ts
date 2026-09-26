import { expect, test } from "vitest"
import { parseChatPhoneNumber } from "../src/chat/create-chat/parsePhoneNumber.ts"

test("parses a formatted international number to digits", async () => {
  await expect(parseChatPhoneNumber("+7 (999) 123-45-67")).resolves.toBe(
    "79991234567",
  )
})

test("keeps an international number entered as digits", async () => {
  await expect(parseChatPhoneNumber("79876543210")).resolves.toBe("79876543210")
})

test("accepts a Russian national number with a leading 8", async () => {
  await expect(parseChatPhoneNumber("8 (987) 654-32-10")).resolves.toBe(
    "79876543210",
  )
})

test("accepts a number from another country", async () => {
  await expect(parseChatPhoneNumber("+1 202 555 0123")).resolves.toBe(
    "12025550123",
  )
})

test("rejects a number that is too short", async () => {
  await expect(parseChatPhoneNumber("123")).resolves.toBeNull()
})
