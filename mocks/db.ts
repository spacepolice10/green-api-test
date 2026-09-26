import type { CheckAccountResult } from "../src/chat/create-chat/checkAccount.ts"
import type { Chat } from "../src/chat/chat-list/getChatList.ts"
import type { Message } from "../src/chat/opened-chat/getChatHistory.ts"
import type { AccountSettings } from "../src/user/getAccountSettings.ts"
import type { InstanceSettings } from "../src/user/settings.ts"
import type { ContactInfo } from "../src/chat/chat-list/useInterlocutor.ts"

export type NotificationBody = {
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
    fileMessageData?: { caption?: string }
  }
}

export type IncomingNotification = {
  receiptId: number
  body: NotificationBody
}

type Store = {
  chats: Chat[]
  messages: Map<string, Message[]>
  contacts: Map<string, ContactInfo>
  settings: InstanceSettings & { outgoingMessageWebhook?: string }
  queue: IncomingNotification[]
  nextReceiptId: number
}

const ANNA = "79991234567@c.us"
const BORIS = "79001112233@c.us"
const TEAM = "120363000000000001@g.us"
const MARINA = "79167654321@c.us"

function nowSeconds(): number {
  return Math.floor(Date.now() / 1000)
}

function avatarDataUrl(letter: string, fill: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" rx="40" fill="${fill}"/><text x="40" y="52" text-anchor="middle" fill="#111" font-size="32" font-family="sans-serif">${letter}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

function textThread(
  chatId: string,
  senderName: string,
  lines: readonly string[],
): Message[] {
  const start = nowSeconds()
  return lines.map((textMessage, index) => {
    const incoming = index % 2 === 0
    return {
      type: incoming ? "incoming" : "outgoing",
      idMessage: `seed-${chatId}-${index}`,
      timestamp: start - index * 75,
      typeMessage: "textMessage",
      chatId,
      textMessage,
      ...(incoming ? { senderName } : { statusMessage: "read" as const }),
    }
  })
}

function createStore(): Store {
  const chats: Chat[] = [
    {
      chatId: ANNA,
      name: "Анна",
      type: "user",
      phoneNumber: 79991234567,
    },
    {
      chatId: BORIS,
      name: "Борис",
      type: "user",
      phoneNumber: 79001112233,
    },
    {
      chatId: TEAM,
      name: "Команда",
      type: "group",
      phoneNumber: 0,
    },
    {
      chatId: MARINA,
      name: "Марина",
      type: "user",
      phoneNumber: 79167654321,
    },
  ]

  const messages = new Map<string, Message[]>([
    [
      ANNA,
      [
        {
          type: "incoming",
          idMessage: "seed-anna-2",
          timestamp: nowSeconds() - 60,
          typeMessage: "textMessage",
          chatId: ANNA,
          textMessage: "Привет! Это фейковый GREEN-API.",
          senderName: "Анна",
        },
        {
          type: "outgoing",
          idMessage: "seed-anna-1",
          timestamp: nowSeconds() - 120,
          typeMessage: "textMessage",
          chatId: ANNA,
          textMessage: "Проверяю историю.",
          statusMessage: "read",
        },
      ],
    ],
    [
      BORIS,
      [
        {
          type: "incoming",
          idMessage: "seed-boris-1",
          timestamp: nowSeconds() - 3600,
          typeMessage: "textMessage",
          chatId: BORIS,
          textMessage: "Наберу позже.",
          senderName: "Борис",
        },
      ],
    ],
    [
      TEAM,
      [
        {
          type: "incoming",
          idMessage: "seed-team-1",
          timestamp: nowSeconds() - 600,
          typeMessage: "textMessage",
          chatId: TEAM,
          textMessage: "Стенд на моках.",
          senderName: "Анна",
        },
      ],
    ],
    [
      MARINA,
      textThread(MARINA, "Марина", [
        "Ладно, я на месте. Можешь не перезванивать.",
        "Ок, тогда допишу сюда.",
        "По ссылке открывается, но грузится долго.",
        "Это мок, там история специально длинная.",
        "Прокрути вверх — там ещё пачка сообщений.",
        "Вижу. До самого начала дошла.",
        "В начале я писала про билеты.",
        "Да, на пятницу, два места у окна.",
        "Одно уже отменилось, второе держу.",
        "Держи, я вечером подтвержу.",
        "Подтвердила. Посадка в 19:40.",
        "Записала. Встречу у выхода B.",
        "Не у B, перенесли на C.",
        "Понял, выход C.",
        "И возьми зарядку, у меня сел пауэрбанк.",
        "Захвачу. Ещё что-то?",
        "Воды и наушники. В самолёте душно.",
        "Вода будет. Наушники твои или мои?",
        "Мои в синей сумке, если найдёшь.",
        "Нашёл. Сумка у двери.",
        "Спасибо. Я ещё в такси.",
        "Напиши, когда будешь у терминала.",
        "У терминала. Очередь на досмотр.",
        "Я уже внутри, у кафе справа.",
        "Вижу кафе. Ты в серой куртке?",
        "Да. Машу рукой.",
        "Иду. Две минуты.",
        "Сели. Наконец-то.",
        "Расскажи, как прошла встреча.",
        "Нормально, но они опять сдвинули срок.",
        "На сколько?",
        "На неделю. Хотят ещё один прогон.",
        "Тогда в понедельник не успеем.",
        "Успеем, если завтра закрыть список.",
        "Список из двенадцати пунктов?",
        "Да. Первые четыре уже готовы.",
        "Пятый — про аватары, я как раз смотрю.",
        "Они разные, не одна заглушка на всех.",
        "У команды тоже появилась картинка.",
        "Фиолетовая, чтобы группу было видно.",
        "А у тебя жёлтая.",
        "Специально, чтобы в списке не терялась.",
        "В тёмной теме нормально читается?",
        "Да, буквы тёмные на светлом круге.",
        "Хорошо. Тогда этот чат оставляем длинным.",
        "Он для проверки прокрутки.",
        "Сообщений больше, чем влезает на экран.",
        "И новые всё равно должны прилипать к низу.",
        "Проверю, отправлю ещё одно снизу.",
        "Жду. Если улетит вверх — это баг.",
        "Пока держится. История идёт сверху вниз.",
        "Самое старое — про билеты, самое новое — это.",
        "Отлично. Можно закрывать стенд.",
        "Не закрывай, я ещё полистаю.",
        "Листай. Я тут.",
        "Нашла самое первое. Всё на месте.",
        "Тогда я спать. Напиши утром.",
        "Напишу. Спокойной ночи.",
        "Спокойной. И не забудь выход C.",
        "Не забуду.",
      ]),
    ],
  ])

  const contacts = new Map<string, ContactInfo>([
    [
      ANNA,
      {
        chatId: ANNA,
        name: "Анна",
        contactName: "Анна",
        avatar: avatarDataUrl("А", "#bffe96"),
        lastSeen: null,
        isBusiness: false,
      },
    ],
    [
      BORIS,
      {
        chatId: BORIS,
        name: "Борис",
        contactName: "Борис",
        avatar: avatarDataUrl("Б", "#baefff"),
        lastSeen: null,
        isBusiness: false,
      },
    ],
    [
      TEAM,
      {
        chatId: TEAM,
        name: "Команда",
        contactName: "Команда",
        avatar: avatarDataUrl("К", "#c4b5fd"),
        lastSeen: null,
        isBusiness: false,
      },
    ],
    [
      MARINA,
      {
        chatId: MARINA,
        name: "Марина",
        contactName: "Марина",
        avatar: avatarDataUrl("М", "#f9ff86"),
        lastSeen: null,
        isBusiness: false,
      },
    ],
  ])

  return {
    chats,
    messages,
    contacts,
    settings: {
      webhookUrl: "",
      incomingWebhook: "no",
      outgoingWebhook: "no",
      stateWebhook: "no",
      outgoingMessageWebhook: "no",
    },
    queue: [],
    nextReceiptId: 1,
  }
}

let store = createStore()
let generation = 0

export function resetDb(): void {
  generation += 1
  store = createStore()
}

export function getChats(): Chat[] {
  return store.chats.map((chat) => ({ ...chat }))
}

export function getChatHistory(chatId: string, count: number): Message[] {
  const messages = store.messages.get(chatId) ?? []
  return messages.slice(0, count).map((message) => ({ ...message }))
}

export function getLastMessages(type: Message["type"]): Message[] {
  const latest: Message[] = []
  for (const messages of store.messages.values()) {
    const message = messages.find((item) => item.type === type)
    if (message) latest.push({ ...message })
  }
  return latest
}

export function getContact(chatId: string): ContactInfo {
  const known = store.contacts.get(chatId)
  if (known) return { ...known }

  const chat = store.chats.find((item) => item.chatId === chatId)
  const name = chat?.name
  return {
    chatId,
    name,
    contactName: name,
    avatar: avatarDataUrl((name ?? "?").slice(0, 1), "#e7e5e4"),
    lastSeen: null,
    isBusiness: false,
  }
}

export function getAvatar(chatId: string): {
  urlAvatar: string
  available: boolean
} {
  const contact = getContact(chatId)
  const letter = (contact.contactName || contact.name || "?").slice(0, 1)
  return {
    urlAvatar: contact.avatar || avatarDataUrl(letter, "#e7e5e4"),
    available: true,
  }
}

export function getAccountSettings(): AccountSettings {
  return {
    avatar: avatarDataUrl("Я", "#a7f3d0"),
    phone: "79001234567",
    stateInstance: "authorized",
    chatId: "10000000",
    historySyncProgress: 100,
    username: "@green",
  }
}

export function getSettings(): Store["settings"] {
  return { ...store.settings }
}

export function setSettings(patch: Partial<Store["settings"]>): {
  saveSettings: true
} {
  const next = { ...store.settings }
  for (const [key, value] of Object.entries(patch)) {
    if (value !== undefined) {
      next[key as keyof Store["settings"]] = value
    }
  }
  store.settings = next
  return { saveSettings: true }
}

export function checkAccount(phoneNumber: number): CheckAccountResult {
  const digits = String(phoneNumber)
  const missing = !/^\d{11,16}$/.test(digits) || digits.endsWith("0000")
  if (missing) {
    return {
      exist: false,
      chatId: "",
      username: "",
      phoneNumber,
      fromCache: false,
    }
  }

  const chatId = `${digits}@c.us`
  if (!store.chats.some((chat) => chat.chatId === chatId)) {
    const chat: Chat = {
      chatId,
      name: digits,
      type: "user",
      phoneNumber,
    }
    store.chats.unshift(chat)
    store.messages.set(chatId, [])
    store.contacts.set(chatId, {
      chatId,
      name: digits,
      contactName: digits,
      avatar: avatarDataUrl(digits.slice(-1), "#e7e5e4"),
      lastSeen: null,
      isBusiness: false,
    })
  }

  return {
    exist: true,
    chatId,
    username: "",
    phoneNumber,
    fromCache: false,
  }
}

export function checkAccountByUsername(username: string): CheckAccountResult {
  const name = username.startsWith("@") ? username.slice(1) : username
  const missing =
    name === "missing" || !/^[A-Za-z][A-Za-z0-9_]{4,31}$/.test(name)
  if (missing) {
    return {
      exist: false,
      chatId: "",
      username,
      phoneNumber: 0,
      fromCache: false,
    }
  }

  const chatId = name
  if (!store.chats.some((chat) => chat.chatId === chatId)) {
    const chat: Chat = {
      chatId,
      name,
      type: "user",
      phoneNumber: 0,
      username: `@${name}`,
    }
    store.chats.unshift(chat)
    store.messages.set(chatId, [])
    store.contacts.set(chatId, {
      chatId,
      name,
      contactName: name,
      avatar: avatarDataUrl(name.slice(-1), "#e7e5e4"),
      lastSeen: null,
      isBusiness: false,
    })
  }

  return {
    exist: true,
    chatId,
    username: `@${name}`,
    phoneNumber: 0,
    fromCache: false,
  }
}

export function sendMessage(
  chatId: string,
  message: string,
): { idMessage: string } {
  const idMessage = crypto.randomUUID()
  const outgoing: Message = {
    type: "outgoing",
    idMessage,
    timestamp: nowSeconds(),
    typeMessage: "textMessage",
    chatId,
    textMessage: message,
    statusMessage: "sent",
  }

  const history = store.messages.get(chatId) ?? []
  store.messages.set(chatId, [outgoing, ...history])

  if (!store.chats.some((chat) => chat.chatId === chatId)) {
    store.chats.unshift({
      chatId,
      name: chatId,
      type: chatId.endsWith("@g.us") ? "group" : "user",
      phoneNumber: 0,
    })
  }

  const scheduledGeneration = generation
  const timer = setTimeout(() => {
    if (scheduledGeneration !== generation) return
    const replyId = crypto.randomUUID()
    const reply: Message = {
      type: "incoming",
      idMessage: replyId,
      timestamp: nowSeconds(),
      typeMessage: "textMessage",
      chatId,
      textMessage: `Эхо: ${message}`,
      senderName: store.chats.find((chat) => chat.chatId === chatId)?.name,
    }
    const current = store.messages.get(chatId) ?? []
    store.messages.set(chatId, [reply, ...current])
    enqueue({
      typeWebhook: "incomingMessageReceived",
      timestamp: reply.timestamp,
      idMessage: replyId,
      senderData: {
        chatId,
        chatName: reply.senderName,
        senderName: reply.senderName,
        chatType: chatId.endsWith("@g.us") ? "group" : "user",
      },
      messageData: {
        typeMessage: "textMessage",
        textMessageData: { textMessage: reply.textMessage },
      },
    })
  }, 400)
  timer.unref?.()

  return { idMessage }
}

export function peekNotification(): IncomingNotification | undefined {
  return store.queue[0]
}

export function deleteNotification(receiptId: number): boolean {
  const index = store.queue.findIndex((item) => item.receiptId === receiptId)
  if (index === -1) return false
  store.queue.splice(index, 1)
  return true
}

export function enqueue(body: NotificationBody): IncomingNotification {
  const notification: IncomingNotification = {
    receiptId: store.nextReceiptId,
    body,
  }
  store.nextReceiptId += 1
  store.queue.push(notification)
  return notification
}
