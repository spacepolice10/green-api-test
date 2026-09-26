import { queryOptions, useQuery } from "@tanstack/react-query"
import { api, apiFetch } from "../../apiFetch"
import { getCredentials } from "../../auth/credentials"
import { useGetChats } from "./getChatList"

export type ContactInfo = {
  chatId: string
  name?: string
  contactName?: string
  avatar?: string
  lastSeen?: string | null
  isBusiness?: boolean
  email?: string
  category?: string
  description?: string
}

export async function getContactInfo(chatId: string): Promise<ContactInfo> {
  if (!chatId) {
    throw new Error("getContactInfo failed: empty chatId")
  }

  const response = await apiFetch(api.getContactInfo, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chatId }),
  })

  if (!response.ok) {
    throw new Error(
      `getContactInfo failed: ${response.status} ${response.statusText}`,
    )
  }

  return response.json() as Promise<ContactInfo>
}

export function contactInfoOptions(chatId: string) {
  return queryOptions({
    queryKey: [api.getContactInfo, chatId] as const,
    queryFn: () => getContactInfo(chatId),
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * Имя собеседника берётся из списка чатов.
 * Запрос контакта — фолбэк, и только когда chatId непустой, а в списке чата нет.
 */
export function useInterlocutor(chatId: string | undefined) {
  const chatsQuery = useGetChats(Boolean(chatId))
  const cached = chatsQuery.data?.find((item) => item.chatId === chatId)
  const chatsReady = chatsQuery.isSuccess || chatsQuery.isError

  const contactQuery = useQuery({
    ...contactInfoOptions(chatId ?? ""),
    enabled:
      Boolean(chatId) && chatsReady && !cached && getCredentials() !== null,
  })

  const fallback =
    cached ??
    (chatId && chatsReady && contactQuery.isError
      ? { chatId, name: chatId }
      : undefined)

  return {
    data: contactQuery.data ? { ...cached, ...contactQuery.data } : fallback,
    isLoading:
      Boolean(chatId) &&
      !cached &&
      !contactQuery.data &&
      (chatsQuery.isLoading || contactQuery.isLoading),
    error: contactQuery.error,
  }
}
