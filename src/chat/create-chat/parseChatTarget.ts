import { parseChatPhoneNumber } from "./parsePhoneNumber.ts"

export type ChatTarget = { phoneNumber: string } | { username: string }

const USERNAME = /^[A-Za-z][A-Za-z0-9_]{4,31}$/

export async function parseChatTarget(
  input: string,
): Promise<ChatTarget | null> {
  const trimmed = input.trim()
  if (!trimmed) return null

  if (trimmed.startsWith("@") || /[A-Za-z]/.test(trimmed)) {
    const name = trimmed.startsWith("@") ? trimmed.slice(1) : trimmed
    if (!USERNAME.test(name)) return null
    return { username: `@${name}` }
  }

  const phoneNumber = await parseChatPhoneNumber(trimmed)
  if (!phoneNumber) return null
  return { phoneNumber }
}
