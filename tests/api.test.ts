import { QueryClient } from "@tanstack/react-query"
import { http, HttpResponse } from "msw"
import { api, apiFetch } from "../src/apiFetch.ts"
import { checkAccount } from "../src/chat/create-chat/checkAccount.ts"
import { setCredentials } from "../src/auth/credentials.ts"
import {
  chatHistoryOptions,
  getChatHistory,
  type Message,
} from "../src/chat/opened-chat/getChatHistory.ts"
import { getChats } from "../src/chat/chat-list/getChatList.ts"
import {
  receiveNotification,
  deleteNotification,
  notificationsPollOptions,
} from "../src/chat/notifications.ts"
import { sendMessage } from "../src/chat/opened-chat/sendMessage.tsx"
import { getAccountSettings } from "../src/user/getAccountSettings.ts"
import { enableIncomingWebhooks, getSettings } from "../src/user/settings.ts"
import { getContactInfo } from "../src/chat/chat-list/useInterlocutor.ts"
import { deleteNotification as dropReceipt } from "../mocks/db.ts"
import { pushIncoming } from "../mocks/handlers.ts"
import { server } from "../mocks/node.ts"
import { beforeEach, expect, test } from "vitest"

const ANNA = "79991234567@c.us"

beforeEach(() => {
  setCredentials({
    idInstance: "1101123456",
    apiTokenInstance: "test-token",
  })
})

test("short idInstance still hits the mock host", async () => {
  setCredentials({ idInstance: "111", apiTokenInstance: "24" })
  const chats = await getChats()
  expect(chats[0]?.name).toBe("Анна")
  expect(await receiveNotification(0)).toBeNull()
})

test("getChats returns the seeded list", async () => {
  const chats = await getChats()
  expect(chats.map((chat) => chat.chatId)).toEqual([
    ANNA,
    "79001112233@c.us",
    "120363000000000001@g.us",
    "79167654321@c.us",
  ])
  expect(chats[0]).toMatchObject({
    name: "Анна",
    type: "user",
    phoneNumber: 79991234567,
  })
})

test("getChatHistory is newest-first and getContactInfo fills the header", async () => {
  const history = await getChatHistory(ANNA, 40)
  expect(history[0]?.textMessage).toBe("Привет! Это фейковый GREEN-API.")
  expect(history[1]?.type).toBe("outgoing")

  const contact = await getContactInfo(ANNA)
  expect(contact.contactName).toBe("Анна")
  expect(contact.avatar).toMatch(/^data:image\/svg\+xml,/)

  const avatarResponse = await apiFetch(api.getAvatar, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chatId: ANNA }),
  })
  expect(avatarResponse.ok).toBe(true)
  await expect(avatarResponse.json()).resolves.toMatchObject({
    available: true,
    urlAvatar: expect.stringMatching(/^data:image\/svg\+xml,/),
  })
})

test("sendMessage appends an outgoing row the history endpoint can read", async () => {
  const sent = await sendMessage(ANNA, "Новое сообщение")
  expect(sent.idMessage).toEqual(expect.any(String))

  const history = await getChatHistory(ANNA, 40)
  expect(history[0]).toMatchObject({
    idMessage: sent.idMessage,
    type: "outgoing",
    textMessage: "Новое сообщение",
    statusMessage: "sent",
  })
})

test("checkAccount accepts a real-looking number and rejects 0000", async () => {
  const found = await checkAccount("79876543210")
  expect(found).toMatchObject({
    exist: true,
    chatId: "79876543210@c.us",
    phoneNumber: 79876543210,
  })
  expect((await getChats()).some((chat) => chat.chatId === found.chatId)).toBe(
    true,
  )

  await expect(checkAccount("79876540000")).rejects.toThrow(
    "В Telegram нет аккаунта с этим номером.",
  )
})

test("checkAccount accepts a username and rejects @missing", async () => {
  const found = await checkAccount("durov")
  expect(found).toMatchObject({
    exist: true,
    chatId: "durov",
    username: "@durov",
  })

  await expect(checkAccount("@missing")).rejects.toThrow(
    "В Telegram нет аккаунта с таким именем.",
  )
})

test("checkAccount rejects input that is neither a number nor a username", async () => {
  await expect(checkAccount("123")).rejects.toThrow(
    "Введите корректный номер телефона или имя пользователя.",
  )
})

test("checkAccount hides the response body behind a generic HTTP error", async () => {
  server.use(
    http.post(/checkAccount/, () =>
      HttpResponse.text("phoneNumber is invalid", {
        status: 400,
        statusText: "Bad Request",
      }),
    ),
  )

  await expect(checkAccount("79876543210")).rejects.toThrow(
    "checkAccount failed: 400 Bad Request",
  )
})

test("getContactInfo rejects an empty chatId", async () => {
  await expect(getContactInfo("")).rejects.toThrow(
    "getContactInfo failed: empty chatId",
  )
})

test("getAccountSettings returns the signed-in Telegram account", async () => {
  await expect(getAccountSettings()).resolves.toMatchObject({
    phone: "79001234567",
    username: "@green",
    stateInstance: "authorized",
    chatId: "10000000",
    historySyncProgress: 100,
  })
})

test("setSettings persists the webhook flags getSettings reads back", async () => {
  expect(await getSettings()).toMatchObject({
    webhookUrl: "",
    incomingWebhook: "no",
  })

  await enableIncomingWebhooks()

  expect(await getSettings()).toMatchObject({
    webhookUrl: "",
    incomingWebhook: "yes",
    outgoingWebhook: "yes",
    stateWebhook: "yes",
  })
})

test("receiveNotification waits, then deleteNotification consumes the receipt", async () => {
  const empty = await receiveNotification(0)
  expect(empty).toBeNull()

  const queued = pushIncoming(ANNA, "Есть новое")
  const notification = await receiveNotification(0)
  expect(notification?.receiptId).toBe(queued.receiptId)
  expect(notification?.body.messageData?.textMessageData?.textMessage).toBe(
    "Есть новое",
  )

  const same = await receiveNotification(0)
  expect(same?.receiptId).toBe(queued.receiptId)

  await deleteNotification(queued.receiptId)
  expect(await receiveNotification(0)).toBeNull()
})

function fetchNotification(queryClient: QueryClient) {
  return queryClient.fetchQuery({
    ...notificationsPollOptions(),
    retry: false,
  })
}

test("a failed delete is retried without applying the receipt twice", async () => {
  let failed = false
  server.use(
    http.delete(/deleteNotification/, ({ request }) => {
      if (!failed) {
        failed = true
        return HttpResponse.text("nope", {
          status: 500,
          statusText: "Server Error",
        })
      }
      const receiptId = Number(new URL(request.url).pathname.split("/").pop())
      dropReceipt(receiptId)
      return HttpResponse.json({ result: true })
    }),
  )

  const queryClient = new QueryClient()
  queryClient.setQueryData<Message[]>(chatHistoryOptions(ANNA).queryKey, [])
  let messageWrites = 0
  const setQueryData = queryClient.setQueryData.bind(queryClient)
  queryClient.setQueryData = ((key, updater, options) => {
    if (Array.isArray(key) && key[0] === chatHistoryOptions(ANNA).queryKey[0]) {
      messageWrites += 1
    }
    return setQueryData(key, updater as never, options)
  }) as typeof queryClient.setQueryData

  pushIncoming(ANNA, "Есть новое")
  await expect(fetchNotification(queryClient)).rejects.toThrow(
    "deleteNotification failed: 500 Server Error",
  )
  await fetchNotification(queryClient)

  const history = queryClient.getQueryData<Message[]>(
    chatHistoryOptions(ANNA).queryKey,
  )
  expect(history).toHaveLength(1)
  expect(messageWrites).toBe(1)
  expect(await receiveNotification(0)).toBeNull()
})

test("a message in another chat is prepended to that chat's cached history", async () => {
  const boris = "79001112233@c.us"
  const queryClient = new QueryClient()
  queryClient.setQueryData<Message[]>(chatHistoryOptions(boris).queryKey, [])

  pushIncoming(boris, "В другом чате", "Борис")
  await fetchNotification(queryClient)

  expect(
    queryClient.getQueryData<Message[]>(
      chatHistoryOptions(boris).queryKey,
    )?.[0],
  ).toMatchObject({
    chatId: boris,
    textMessage: "В другом чате",
    type: "incoming",
  })
})

test("a message in another chat leaves the open chat history in place", async () => {
  const boris = "79001112233@c.us"
  const queryClient = new QueryClient()
  queryClient.setQueryData(chatHistoryOptions(ANNA).queryKey, [])

  pushIncoming(boris, "В другом чате", "Борис")
  await fetchNotification(queryClient)

  expect(queryClient.getQueryData(chatHistoryOptions(ANNA).queryKey)).toEqual(
    [],
  )
  expect(
    queryClient.getQueryState(chatHistoryOptions(ANNA).queryKey)?.isInvalidated,
  ).toBe(false)
})
