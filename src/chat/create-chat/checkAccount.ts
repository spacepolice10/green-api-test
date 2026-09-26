import { useMutation } from "@tanstack/react-query"
import { api, apiFetch } from "../../apiFetch"
import { chatsOptions } from "../chat-list/getChatList"
import { parseChatTarget } from "./parseChatTarget"

export type CheckAccountResult = {
  exist: boolean
  chatId: string
  username: string
  phoneNumber: number
  fromCache: boolean
}

export async function checkAccount(raw: string): Promise<CheckAccountResult> {
  const target = await parseChatTarget(raw)
  if (!target) {
    throw new Error("Введите корректный номер телефона или имя пользователя.")
  }

  const body = JSON.stringify(
    "phoneNumber" in target
      ? { phoneNumber: Number(target.phoneNumber) }
      : { username: target.username },
  )

  const response = await apiFetch(api.checkAccount, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  })

  if (!response.ok) {
    throw new Error(
      `checkAccount failed: ${response.status} ${response.statusText}`,
    )
  }

  const account = (await response.json()) as CheckAccountResult
  if (!account.exist || !account.chatId) {
    throw new Error(
      "username" in target
        ? "В Telegram нет аккаунта с таким именем."
        : "В Telegram нет аккаунта с этим номером.",
    )
  }

  return account
}

export function useCheckAccount() {
  return useMutation({
    mutationFn: (raw: string) => checkAccount(raw),
    onSuccess: (_data, _variables, _onMutateResult, { client }) => {
      client.invalidateQueries({ queryKey: chatsOptions().queryKey })
    },
  })
}
