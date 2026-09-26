import { useCallback, useState } from "react"
import { getCredentials } from "../auth/credentials"
import { useEnableIncomingWebhooks, useGetSettings } from "../user/settings"
import { Skeleton } from "../shared/Skeleton"
import { Toast } from "../shared/Toasts"

export function IncomingMessagesSwitcher() {
  const credentials = getCredentials()
  const { data: settings, isLoading, error: settingsError } = useGetSettings()
  const [toastOpen, setToastOpen] = useState(false)
  const closeToast = useCallback(() => setToastOpen(false), [])

  const { mutate, isPending, error } = useEnableIncomingWebhooks()

  if (!credentials) return null

  const enabled = settings?.incomingWebhook === "yes" && !settings.webhookUrl
  const problem = (error ?? settingsError)?.message

  return (
    <>
      {isLoading || !settings ? (
        <Skeleton className="h-4 w-2/3" />
      ) : (
        <div className="border-quaternary bg-tertiary rounded-md border p-2">
          <h3 className="text-sm font-bold text-white">
            {enabled ? "Входящие включены" : "Входящие выключены"}
          </h3>
          {problem && <p className="text-sm">{problem}</p>}
          <p className="text-invert-2 pt-2 text-sm">
            По умолчанию приложение не отслеживает оповещения из Telegram. Для
            того чтобы приложение могло отслеживать оповещения, необходимо
            включить входящие вебхуки.
          </p>

          <button
            type="button"
            className="mt-4 ml-auto flex w-fit gap-2"
            disabled={isPending}
            onClick={() =>
              mutate(undefined, { onSuccess: () => setToastOpen(true) })
            }
          >
            <span className="text-sm">{enabled ? "🟢" : "🔴"}</span>
            <span className="text-sm">Включить входящие</span>
          </button>
        </div>
      )}

      <Toast
        open={toastOpen}
        onClose={closeToast}
        message="Настройки применятся в течение 5 минут"
      />
    </>
  )
}
