import { queryOptions, useQuery, type QueryClient } from "@tanstack/react-query"
import { api, apiFetch } from "../apiFetch"
import { getCredentials } from "../auth/credentials"
import { chatHistoryOptions, type Message } from "./opened-chat/getChatHistory"
import { chatsOptions, type Chat } from "./chat-list/getChatList"
import { journalOptions, type JournalMessage } from "./chat-list/getJournal"
import { showToast } from "../shared/showToast"

type NotificationBody = {
  typeWebhook: string
  timestamp: number
  idMessage?: string
  senderData?: {
    chatId: string
    chatName?: string
    chatType?: string
    senderName?: string
  }
  messageData?: {
    typeMessage: string
    textMessageData?: { textMessage?: string }
  }
}

type IncomingNotification = {
  receiptId: number
  body: NotificationBody
}

export async function receiveNotification(
  receiveTimeout = 5,
): Promise<IncomingNotification | null> {
  const response = await apiFetch(
    api.receiveNotification,
    undefined,
    `?receiveTimeout=${receiveTimeout}`,
  )

  if (!response.ok) {
    throw new Error(
      `receiveNotification failed: ${response.status} ${response.statusText}`,
    )
  }

  const text = await response.text()
  if (!text || text === "null") return null
  return JSON.parse(text) as IncomingNotification
}

export async function deleteNotification(receiptId: number): Promise<void> {
  const response = await apiFetch(
    api.deleteNotification,
    { method: "DELETE" },
    `/${receiptId}`,
  )

  if (!response.ok) {
    throw new Error(
      `deleteNotification failed: ${response.status} ${response.statusText}`,
    )
  }
}

function notificationToMessage(body: NotificationBody): Message | null {
  if (
    body.typeWebhook !== "incomingMessageReceived" &&
    body.typeWebhook !== "outgoingMessageReceived"
  ) {
    return null
  }
  if (!body.idMessage || !body.senderData?.chatId || !body.messageData) {
    return null
  }

  return {
    type:
      body.typeWebhook === "incomingMessageReceived" ? "incoming" : "outgoing",
    idMessage: body.idMessage,
    timestamp: body.timestamp,
    typeMessage: body.messageData.typeMessage,
    chatId: body.senderData.chatId,
    chatType: body.senderData.chatType,
    textMessage: body.messageData.textMessageData?.textMessage,
    senderName: body.senderData.senderName,
  }
}
// TODO: По-хорошему, вытащить обработчики сообщений с обновлением кэша в отдельные модули
export function updateLatestPreviews(
  queryClient: QueryClient,
  message: Message,
) {
  queryClient.setQueryData<JournalMessage[]>(
    journalOptions().queryKey,
    (current = []) => {
      const newest = current.reduce<JournalMessage | undefined>(
        (best, item) => {
          if (item.chatId !== message.chatId) return best
          if (!best || item.timestamp > best.timestamp) return item
          return best
        },
        undefined,
      )
      if (newest && newest.timestamp > message.timestamp) return current
      return [
        {
          type: message.type,
          chatId: message.chatId,
          timestamp: message.timestamp,
          textMessage: message.textMessage,
          senderName: message.senderName,
          chatType: message.chatType,
        },
        ...current,
      ]
    },
  )
}

function updateChatList(
  queryClient: QueryClient,
  chatId: string,
  chatName?: string,
) {
  queryClient.setQueryData<Chat[]>(chatsOptions().queryKey, (chats) => {
    if (!chats) return chats

    const index = chats.findIndex((chat) => chat.chatId === chatId)
    if (index === -1) {
      const stub: Chat = {
        chatId,
        name: chatName || chatId,
        type: "user",
        phoneNumber: 0,
      }
      return [stub, ...chats]
    }

    if (index === 0) return chats

    const chat = chats[index]
    return [chat, ...chats.filter((_, i) => i !== index)]
  })
}

function updateChatHistory(queryClient: QueryClient, message: Message) {
  const queryKey = chatHistoryOptions(message.chatId).queryKey
  if (queryClient.getQueryData(queryKey) === undefined) return

  queryClient.setQueryData<Message[]>(queryKey, (messages) => {
    if (!messages) return messages
    if (messages.some((item) => item.idMessage === message.idMessage)) {
      return messages
    }
    return [message, ...messages]
  })
}

function openedChatId() {
  const match = globalThis.location?.pathname.match(/^\/chats\/([^/]+)/)
  if (!match || match[1] === "new") return
  return decodeURIComponent(match[1])
}

function processNotification(queryClient: QueryClient, body: NotificationBody) {
  const message = notificationToMessage(body)
  if (!message) return

  updateLatestPreviews(queryClient, message)

  const name =
    body.senderData?.chatName ?? body.senderData?.senderName ?? message.chatId
  updateChatList(queryClient, message.chatId, name)
  updateChatHistory(queryClient, message)
  if (message.type === "incoming" && message.chatId !== openedChatId()) {
    showToast(`${name}: ${message.textMessage || "Новое сообщение"}`)
  }
}

export function notificationsPollOptions() {
  return queryOptions({
    queryKey: [api.receiveNotification] as const,
    queryFn: async ({ client }) => {
      const notification = await receiveNotification(30)
      if (!notification) return null

      /** Очистка очереди в GREEN-API */
      await deleteNotification(notification.receiptId)
      /** Обработка уведомления */
      processNotification(client, notification.body)
      return notification.receiptId
    },
    staleTime: 0,
    gcTime: 0,
  })
}

/** Поллинг вместо вебхуков, потому что это clinet-side-only приложение. Было бы правильнее подключить небольшой Hono-сервер */
export function useNotificationsPoll(enabled = true) {
  return useQuery({
    ...notificationsPollOptions(),
    enabled: enabled && getCredentials() !== null,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
    retry: true,
  })
}
