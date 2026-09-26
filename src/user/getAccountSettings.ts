import { queryOptions, useQuery } from "@tanstack/react-query"
import { api, apiFetch } from "../apiFetch"
import { getCredentials } from "../auth/credentials"

export type AccountSettings = {
  avatar: string
  phone: string
  stateInstance: string
  chatId: string
  username: string
  historySyncProgress: number
  suspendedUntil?: number
}

export async function getAccountSettings(): Promise<AccountSettings> {
  const response = await apiFetch(api.getAccountSettings)

  if (!response.ok) {
    throw new Error(
      `getAccountSettings failed: ${response.status} ${response.statusText}`,
    )
  }

  return response.json() as Promise<AccountSettings>
}

export function accountSettingsOptions() {
  return queryOptions({
    queryKey: [api.getAccountSettings] as const,
    queryFn: getAccountSettings,
    staleTime: 1000 * 60 * 5,
  })
}

export function useGetAccountSettings(enabled = true) {
  return useQuery({
    ...accountSettingsOptions(),
    enabled: enabled && getCredentials() !== null,
  })
}
