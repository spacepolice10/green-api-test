import { queryOptions, useQuery } from "@tanstack/react-query"
import { api, apiFetch } from "../../apiFetch"
import { getCredentials } from "../../auth/credentials"

export type Chat = {
  chatId: string
  name: string
  type: "user" | "group" | "supergroup" | "channel" | "bot"
  phoneNumber: number
  username?: string
}

export async function getChats(): Promise<Chat[]> {
  const response = await apiFetch(api.getChats)

  if (!response.ok) {
    throw new Error(
      `getChats failed: ${response.status} ${response.statusText}`,
    )
  }

  return response.json() as Promise<Chat[]>
}

export function chatsOptions() {
  return queryOptions({
    queryKey: [api.getChats] as const,
    queryFn: getChats,
  })
}

export function useGetChats(enabled = true) {
  return useQuery({
    ...chatsOptions(),
    enabled: enabled && getCredentials() !== null,
  })
}
