import { delay, http, HttpResponse } from "msw"
import {
  checkAccount,
  checkAccountByUsername,
  deleteNotification,
  enqueue,
  getAccountSettings,
  getAvatar,
  getChatHistory,
  getChats,
  getLastMessages,
  getContact,
  getSettings,
  peekNotification,
  sendMessage,
  setSettings,
} from "./db.ts"

// Host is idInstance.slice(0, 4), so it can be shorter than 4 characters.
const GREEN_API =
  /^https:\/\/[^/?#]+\.api\.green-api\.com\/waInstance([^/]+)\/([^/]+)\/([^/?]+)(?:\/([^/?]+))?\/?(?:\?.*)?$/

function matchGreenApi(url: string) {
  const match = GREEN_API.exec(url)
  if (!match) return null
  return {
    instanceId: match[1],
    method: match[2],
    token: match[3],
    extra: match[4],
  }
}

async function readJson(request: Request): Promise<Record<string, unknown>> {
  const text = await request.text()
  if (!text) return {}
  return JSON.parse(text) as Record<string, unknown>
}

export const handlers = [
  http.all(matchGreenApiRequest, async ({ request }) => {
    const route = matchGreenApi(request.url)
    if (!route?.token) {
      return HttpResponse.text("Unauthorized", { status: 401 })
    }

    const url = new URL(request.url)
    const { method, extra } = route

    if (method === "getChats" && request.method === "GET") {
      return HttpResponse.json(getChats())
    }

    if (method === "getSettings" && request.method === "GET") {
      return HttpResponse.json(getSettings())
    }

    if (method === "getAccountSettings" && request.method === "GET") {
      return HttpResponse.json(getAccountSettings())
    }

    if (method === "setSettings" && request.method === "POST") {
      const body = await readJson(request)
      return HttpResponse.json(
        setSettings({
          webhookUrl:
            typeof body.webhookUrl === "string" ? body.webhookUrl : undefined,
          incomingWebhook:
            typeof body.incomingWebhook === "string"
              ? body.incomingWebhook
              : undefined,
          outgoingWebhook:
            typeof body.outgoingWebhook === "string"
              ? body.outgoingWebhook
              : undefined,
          stateWebhook:
            typeof body.stateWebhook === "string"
              ? body.stateWebhook
              : undefined,
          outgoingMessageWebhook:
            typeof body.outgoingMessageWebhook === "string"
              ? body.outgoingMessageWebhook
              : undefined,
        }),
      )
    }

    if (
      (method === "lastIncomingMessages" ||
        method === "lastOutgoingMessages") &&
      request.method === "GET"
    ) {
      return HttpResponse.json(
        getLastMessages(
          method === "lastIncomingMessages" ? "incoming" : "outgoing",
        ),
      )
    }

    if (method === "getChatHistory" && request.method === "POST") {
      const body = await readJson(request)
      const chatId = String(body.chatId ?? "")
      const count = Number(body.count ?? 40)
      return HttpResponse.json(getChatHistory(chatId, count))
    }

    if (method === "getContactInfo" && request.method === "POST") {
      const body = await readJson(request)
      return HttpResponse.json(getContact(String(body.chatId ?? "")))
    }

    if (method === "getAvatar" && request.method === "POST") {
      const body = await readJson(request)
      return HttpResponse.json(getAvatar(String(body.chatId ?? "")))
    }

    if (method === "sendMessage" && request.method === "POST") {
      const body = await readJson(request)
      const chatId = String(body.chatId ?? "")
      const message = String(body.message ?? "")
      if (!chatId || !message) {
        return HttpResponse.text("chatId and message are required", {
          status: 400,
        })
      }
      return HttpResponse.json(sendMessage(chatId, message))
    }

    if (method === "checkAccount" && request.method === "POST") {
      const body = await readJson(request)
      if (typeof body.username === "string" && body.username) {
        return HttpResponse.json(checkAccountByUsername(body.username))
      }
      const phoneNumber = Number(body.phoneNumber)
      return HttpResponse.json(checkAccount(phoneNumber))
    }

    if (method === "receiveNotification" && request.method === "GET") {
      const timeoutSec = Number(url.searchParams.get("receiveTimeout") ?? "5")
      const deadline = Date.now() + Math.max(0, timeoutSec) * 1000
      while (Date.now() <= deadline) {
        const notification = peekNotification()
        if (notification) return HttpResponse.json(notification)
        if (Date.now() >= deadline) break
        await delay(20)
      }
      return HttpResponse.json(null)
    }

    if (method === "deleteNotification" && request.method === "DELETE") {
      const receiptId = Number(extra)
      if (!Number.isFinite(receiptId)) {
        return HttpResponse.text("receiptId is required", { status: 400 })
      }
      deleteNotification(receiptId)
      return HttpResponse.json({ result: true })
    }

    return HttpResponse.text(`Unknown method ${method}`, { status: 404 })
  }),
]

function matchGreenApiRequest({ request }: { request: Request }): boolean {
  return matchGreenApi(request.url) !== null
}

export function pushIncoming(
  chatId: string,
  text: string,
  senderName = "Анна",
) {
  return enqueue({
    typeWebhook: "incomingMessageReceived",
    timestamp: Math.floor(Date.now() / 1000),
    idMessage: crypto.randomUUID(),
    senderData: {
      chatId,
      chatName: senderName,
      senderName,
      chatType: chatId.endsWith("@g.us") ? "group" : "user",
    },
    messageData: {
      typeMessage: "textMessage",
      textMessageData: { textMessage: text },
    },
  })
}
