import { type SubmitEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useCheckAccount } from "./checkAccount"

export function CreateChat() {
  const navigate = useNavigate()
  const { mutate, isPending, error, reset } = useCheckAccount()

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const raw = String(new FormData(event.currentTarget).get("account") ?? "")

    mutate(raw, {
      onSuccess: (account) => {
        navigate(`/chats/${account.chatId}`, { replace: true })
      },
    })
  }

  return (
    <section className="flex h-full min-h-0 w-full flex-col overflow-hidden">
      <header className="border-quaternary flex shrink-0 items-center gap-2 border-b p-2">
        <Link
          to="/"
          aria-label="Назад"
          className="flex size-10 shrink-0 items-center justify-center md:hidden"
        >
          <span className="icon-wrap">
            <span className="icon icon-chevron-left" />
          </span>
        </Link>
        <div>
          <div>Новый чат</div>
          <small className="text-invert-3">Контакта пока нет</small>
        </div>
      </header>
      <div className="flex min-h-0 flex-1 items-center justify-center p-6">
        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-xs flex-col items-center gap-4 text-center"
        >
          <p className="text-invert-3 text-sm">
            Введите номер телефона или имя пользователя в Telegram. Знак @
            необязателен. Поле ввода появится, когда аккаунт будет найден.
          </p>
          <label className="relative flex w-full flex-col gap-1 text-left">
            <p
              id="account-error"
              role="alert"
              className="text-danger absolute right-0 bottom-full left-0 h-4 truncate text-xs leading-4"
            >
              {error?.message}
            </p>
            <span className="text-invert-3 text-xs">
              Номер телефона или имя пользователя в Telegram
            </span>
            <input
              name="account"
              type="text"
              required
              autoFocus
              placeholder="+7 или username"
              disabled={isPending}
              onChange={() => {
                if (error) reset()
              }}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "account-error" : undefined}
              className="border-quaternary bg-prim text-invert-1 focus:border-invert-4 min-h-10 w-full rounded-md border px-3 py-2 outline-none"
            />
          </label>
          <button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Проверка…" : "Создать чат"}
          </button>
        </form>
      </div>
    </section>
  )
}
