import { queryOptions, useQuery } from "@tanstack/react-query"
import { api, apiFetch } from "../../apiFetch"
import { getCredentials } from "../../auth/credentials"

export type JournalMessage = {
  type: "incoming" | "outgoing"
  chatId: string
  timestamp: number
  textMessage?: string
  senderName?: string
  chatType?: string
}

const JOURNAL_MINUTES = 1440

export async function getJournal(
  type: JournalMessage["type"],
  minutes = JOURNAL_MINUTES,
  signal?: AbortSignal,
): Promise<JournalMessage[]> {
  const method =
    type === "incoming" ? api.lastIncomingMessages : api.lastOutgoingMessages
  const response = await apiFetch(method, { signal }, `?minutes=${minutes}`)

  if (!response.ok) {
    throw new Error(
      `${method} failed: ${response.status} ${response.statusText}`,
    )
  }

  return response.json() as Promise<JournalMessage[]>
}

export function journalOptions() {
  return queryOptions({
    queryKey: [api.lastIncomingMessages, api.lastOutgoingMessages] as const,
    queryFn: async ({ signal }) => {
      const [incoming, outgoing] = await Promise.all([
        getJournal("incoming", JOURNAL_MINUTES, signal),
        getJournal("outgoing", JOURNAL_MINUTES, signal),
      ])
      return [...incoming, ...outgoing]
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60 * 24,
  })
}

export function useGetJournal(enabled = true) {
  return useQuery({
    ...journalOptions(),
    enabled: enabled && getCredentials() !== null,
  })
}
