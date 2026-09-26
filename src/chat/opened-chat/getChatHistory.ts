import {
  keepPreviousData,
  queryOptions,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { useEffect } from "react"
import { api, apiFetch } from "../../apiFetch"
import { getCredentials } from "../../auth/credentials"
import { updateLatestPreviews } from "../notifications"

export type Message = {
  type: "incoming" | "outgoing"
  idMessage: string
  timestamp: number
  typeMessage: string
  chatId: string
  chatType?: string
  textMessage?: string
  senderName?: string
  statusMessage?: string
}

export async function getChatHistory(
  chatId: string,
  count = 50,
  signal?: AbortSignal,
): Promise<Message[]> {
  const response = await apiFetch(api.getChatHistory, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chatId, count }),
    signal,
  })

  if (!response.ok) {
    throw new Error(
      `getChatHistory failed: ${response.status} ${response.statusText}`,
    )
  }

  return response.json() as Promise<Message[]>
}

export function chatHistoryOptions(chatId: string) {
  return queryOptions({
    queryKey: [api.getChatHistory, chatId] as const,
    queryFn: ({ signal }) => getChatHistory(chatId, 50, signal),
    staleTime: 0,
    gcTime: 1000 * 60 * 60 * 24,
  })
}

export function useGetChatHistory(chatId: string | undefined, enabled = true) {
  const queryClient = useQueryClient()
  const query = useQuery({
    ...chatHistoryOptions(chatId ?? ""),
    placeholderData: keepPreviousData,
    enabled: enabled && Boolean(chatId) && getCredentials() !== null,
  })

  const latest = query.isPlaceholderData ? undefined : query.data?.[0]
  useEffect(() => {
    if (latest) updateLatestPreviews(queryClient, latest)
  }, [latest, queryClient])

  return query
}
