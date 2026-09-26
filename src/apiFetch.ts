import { getCredentials } from "./auth/credentials"

export const api = {
  getChats: "getChats",
  getChatHistory: "getChatHistory",
  getContactInfo: "getContactInfo",
  getAvatar: "getAvatar",
  getSettings: "getSettings",
  getAccountSettings: "getAccountSettings",
  setSettings: "setSettings",
  receiveNotification: "receiveNotification",
  deleteNotification: "deleteNotification",
  sendMessage: "sendMessage",
  checkAccount: "checkAccount",
  lastIncomingMessages: "lastIncomingMessages",
  lastOutgoingMessages: "lastOutgoingMessages",
} as const

export type ApiMethod = (typeof api)[keyof typeof api]

export type ApiContext = {
  idInstance: string
  apiTokenInstance: string
  apiUrl: string
}

function resolveApiUrl(idInstance: string): string {
  return `https://${idInstance.slice(0, 4)}.api.green-api.com`
}

export function getApiContext(): ApiContext {
  const credentials = getCredentials()
  if (!credentials) {
    throw new Error(
      "Missing credentials. Save idInstance and apiTokenInstance first.",
    )
  }

  return {
    idInstance: credentials.idInstance,
    apiTokenInstance: credentials.apiTokenInstance,
    apiUrl: resolveApiUrl(credentials.idInstance),
  }
}

/** Resolves credentials + instance URL. Callers only pick `api.*` and handle the response. */
export async function apiFetch(
  method: ApiMethod,
  init?: RequestInit,
  suffix = "",
): Promise<Response> {
  const { apiUrl, idInstance, apiTokenInstance } = getApiContext()
  const url = `${apiUrl}/waInstance${idInstance}/${method}/${apiTokenInstance}${suffix}`
  return fetch(url, init)
}
