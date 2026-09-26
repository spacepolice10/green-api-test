import { queryOptions, useMutation, useQuery } from "@tanstack/react-query"
import { api, apiFetch } from "../apiFetch"
import { getCredentials } from "../auth/credentials"

export type InstanceSettings = {
  webhookUrl: string
  incomingWebhook: string
  outgoingWebhook?: string
  stateWebhook?: string
}

export async function getSettings(): Promise<InstanceSettings> {
  const response = await apiFetch(api.getSettings)

  if (!response.ok) {
    throw new Error(
      `getSettings failed: ${response.status} ${response.statusText}`,
    )
  }

  return response.json() as Promise<InstanceSettings>
}

export async function enableIncomingWebhooks(): Promise<void> {
  const response = await apiFetch(api.setSettings, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      webhookUrl: "",
      incomingWebhook: "yes",
      outgoingWebhook: "yes",
      outgoingMessageWebhook: "yes",
      stateWebhook: "yes",
    }),
  })

  if (!response.ok) {
    throw new Error(
      `setSettings failed: ${response.status} ${response.statusText}`,
    )
  }

  const data = (await response.json()) as { saveSettings?: boolean }
  if (!data.saveSettings) {
    throw new Error("setSettings did not save settings")
  }
}

export function settingsOptions() {
  return queryOptions({
    queryKey: [api.getSettings] as const,
    queryFn: getSettings,
  })
}

export function useGetSettings(enabled = true) {
  return useQuery({
    ...settingsOptions(),
    enabled: enabled && getCredentials() !== null,
  })
}

export function useEnableIncomingWebhooks() {
  return useMutation({
    mutationFn: enableIncomingWebhooks,
    onSuccess: (_data, _variables, _onMutateResult, { client }) => {
      client.invalidateQueries({
        queryKey: settingsOptions().queryKey,
      })
    },
  })
}
