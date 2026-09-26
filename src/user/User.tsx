import { useRef } from "react"
import { Skeleton } from "../shared/Skeleton"
import { useGetAccountSettings } from "./getAccountSettings"
import { IncomingMessagesSwitcher } from "./IncomingMessagesSwitcher"
import { LogoutButton } from "./LogoutButton"
import { useGetSettings } from "./settings"

function accountLabel(
  account: { username: string; phone: string } | undefined,
) {
  if (!account) return "User"
  return account.username || account.phone || "User"
}

export function User() {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { data, isLoading } = useGetAccountSettings()
  const label = accountLabel(data)
  const initial = (label.replace(/^@/, "").slice(0, 1) || "U").toUpperCase()
  const { data: settings, isLoading: settingsLoading } = useGetSettings()
  const enabled = settings?.incomingWebhook === "yes" && !settings.webhookUrl
  return (
    <>
    {!enabled && !settingsLoading && <p className="text-sm text-danger bg-danger/10 border-danger/20 border rounded-md p-2 mb-2 text-center gap-4 flex items-center justify-center"><span className="text-xl">{enabled ? "🟢" : "🔴"}</span>   {enabled ? "Входящие включены" : "Входящие выключены"}</p>}
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={() => dialogRef.current?.showModal()}
        className="hover:bg-tertiary text-invert-1 flex w-full items-center gap-2 rounded-md bg-transparent p-2 font-normal"
      >
        {isLoading && !data ? (
          <>
            <Skeleton className="size-8 shrink-0 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </>
        ) : (
          <>
            {data?.avatar ? (
              <img
                src={data.avatar}
                alt=""
                className="size-8 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span className="bg-second text-invert-1 border-quaternary flex size-8 items-center justify-center rounded-full border text-sm">
                {initial}
              </span>
            )}
            <span className="min-w-0 truncate">{label}</span>
          </>
        )}
      </button>
      <dialog
        ref={dialogRef}
        closedby="any"
        aria-labelledby="user-dialog-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close()
        }}
        className="border-quaternary bg-second text-invert-1 fixed inset-x-0 top-auto bottom-0 m-0 h-fit w-full max-w-none rounded-t-2xl rounded-b-none border border-b-0 p-0 pb-[env(safe-area-inset-bottom)] backdrop:bg-black/40 md:inset-0 md:m-auto md:w-[min(24rem,calc(100vw-2rem))] md:max-w-[min(24rem,calc(100vw-2rem))] md:rounded-2xl md:border-b md:pb-0"
      >
        <header className="border-quaternary border-b px-4 py-3">
          <h2 id="user-dialog-title" className="text-base font-semibold">
            {label}
          </h2>
        </header>
        <div className="flex flex-col gap-4 p-4">
          <IncomingMessagesSwitcher />
          <LogoutButton />
        </div>
      </dialog>
    </>
  )
}
