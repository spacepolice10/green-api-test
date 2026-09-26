import { useMutation } from "@tanstack/react-query"
import { api, apiFetch } from "../../apiFetch"
import { chatHistoryOptions, type Message } from "./getChatHistory"
import { updateLatestPreviews } from "../notifications"

export type SendMessageResult = {
  idMessage: string
}

type SendMessageVariables = {
  chatId: string
  message: string
}

type SendMessageContext = {
  previous: Message[] | undefined
  optimisticId: string
  chatId: string
}

export async function sendMessage(
  chatId: string,
  message: string,
): Promise<SendMessageResult> {
  const response = await apiFetch(api.sendMessage, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chatId, message }),
  })

  if (!response.ok) {
    throw new Error(
      `sendMessage failed: ${response.status} ${response.statusText}`,
    )
  }

  return response.json() as Promise<SendMessageResult>
}

export function useSendMessage() {
  return useMutation({
    mutationFn: ({ chatId, message }: SendMessageVariables) =>
      sendMessage(chatId, message),
    onMutate: async (
      { chatId, message },
      { client },
    ): Promise<SendMessageContext> => {
      const queryKey = chatHistoryOptions(chatId).queryKey
      await client.cancelQueries({ queryKey })

      const previous = client.getQueryData<Message[]>(queryKey)
      const optimisticId = `optimistic-${crypto.randomUUID()}`
      const optimistic: Message = {
        type: "outgoing",
        idMessage: optimisticId,
        timestamp: Math.floor(Date.now() / 1000),
        typeMessage: "textMessage",
        chatId,
        textMessage: message,
        statusMessage: "pending",
      }

      client.setQueryData<Message[]>(queryKey, (messages) =>
        messages ? [optimistic, ...messages] : [optimistic],
      )
      updateLatestPreviews(client, optimistic)

      return { previous, optimisticId, chatId }
    },
    onError: (_error, _variables, onMutateResult, { client }) => {
      if (!onMutateResult) return
      client.setQueryData(
        chatHistoryOptions(onMutateResult.chatId).queryKey,
        onMutateResult.previous,
      )
    },
    onSuccess: (result, { chatId, message }, onMutateResult, { client }) => {
      const outgoing: Message = {
        type: "outgoing",
        idMessage: result.idMessage,
        timestamp: Math.floor(Date.now() / 1000),
        typeMessage: "textMessage",
        chatId,
        textMessage: message,
        statusMessage: "sent",
      }

      client.setQueryData<Message[]>(
        chatHistoryOptions(chatId).queryKey,
        (messages) => {
          if (!messages) return [outgoing]

          const withoutOptimistic = onMutateResult?.optimisticId
            ? messages.filter(
                (item) => item.idMessage !== onMutateResult.optimisticId,
              )
            : messages

          if (
            withoutOptimistic.some(
              (item) => item.idMessage === outgoing.idMessage,
            )
          ) {
            return withoutOptimistic
          }

          return [outgoing, ...withoutOptimistic]
        },
      )
      updateLatestPreviews(client, outgoing)
    },
  })
}
