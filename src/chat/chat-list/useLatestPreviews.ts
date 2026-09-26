import { useMemo } from "react"
import { useGetJournal, type JournalMessage } from "./getJournal"

export type LastPreview = {
  chatId: string
  timestamp: number
  textMessage?: string
  senderName?: string
  chatType?: string
}

function foldLatest(messages: JournalMessage[]): Record<string, LastPreview> {
  const previews: Record<string, LastPreview> = {}
  for (const message of messages) {
    const current = previews[message.chatId]
    if (current && current.timestamp >= message.timestamp) continue
    previews[message.chatId] = {
      chatId: message.chatId,
      timestamp: message.timestamp,
      textMessage: message.textMessage,
      senderName: message.senderName,
      chatType: message.chatType,
    }
  }
  return previews
}

export function useLatestPreviews(enabled = true) {
  const journal = useGetJournal(enabled)
  const data = useMemo(
    () => (journal.data ? foldLatest(journal.data) : undefined),
    [journal.data],
  )
  return { ...journal, data }
}
