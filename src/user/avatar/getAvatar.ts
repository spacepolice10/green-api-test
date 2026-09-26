import { queryOptions, useQuery } from "@tanstack/react-query"
import { api, apiFetch } from "../../apiFetch"
import { getCredentials } from "../../auth/credentials"

type AvatarInfo = {
  urlAvatar: string
  available: boolean
}

export async function getAvatar(chatId: string): Promise<AvatarInfo> {
  const response = await apiFetch(api.getAvatar, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chatId }),
  })

  if (!response.ok) {
    throw new Error(
      `getAvatar failed: ${response.status} ${response.statusText}`,
    )
  }

  return response.json() as Promise<AvatarInfo>
}

export function avatarOptions(chatId: string) {
  return queryOptions({
    queryKey: [api.getAvatar, chatId] as const,
    queryFn: () => getAvatar(chatId),
    retry: false,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}

export function useGetAvatar(chatId: string, enabled = true) {
  return useQuery({
    ...avatarOptions(chatId),
    enabled: enabled && getCredentials() !== null,
  })
}
