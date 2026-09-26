export async function parseChatPhoneNumber(
  input: string,
): Promise<string | null> {
  const { parsePhoneNumberFromString } = await import("libphonenumber-js/min")
  const phone = parsePhoneNumberFromString(input, "RU")
  if (!phone?.isValid()) return null
  return phone.number.slice(1)
}
