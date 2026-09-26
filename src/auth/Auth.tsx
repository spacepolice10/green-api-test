import type { SubmitEvent } from "react"
import { setCredentials } from "./credentials"
import { useNavigate } from "react-router-dom"

export function Auth() {
  const navigate = useNavigate()
  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.target as HTMLFormElement)
    const idInstance = formData.get("idInstance") as string
    const apiTokenInstance = formData.get("apiTokenInstance") as string
    const remember = formData.get("remember") === "on"
    setCredentials({ idInstance, apiTokenInstance }, remember)
    navigate("/")
  }

  return (
    <main className="bg-prim flex h-dvh items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="border-quaternary bg-second flex w-full max-w-sm flex-col gap-4 rounded-2xl border p-6"
      >
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Авторизация</h1>
          <p className="text-invert-3 text-sm">
            idInstance и apiTokenInstance из кабинета
          </p>
          <a
            href="https://console.green-api.com/"
            target="_blank"
            rel="noreferrer"
            className="border-quaternary bg-prim text-invert-1 hover:border-invert-4 inline-flex w-fit items-center gap-2 rounded-sm border py-1 pr-2.5 pl-1 text-xs font-medium"
          >
            <img
              src="/green-api-mark.svg"
              alt=""
              width={18}
              height={22}
              className="h-[18px] w-auto"
            />
            Кабинет GREEN-API
          </a>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-invert-4 text-xs">idInstance</span>
          <input
            name="idInstance"
            type="text"
            required
            autoComplete="username"
            placeholder="1101123456"
            className="border-quaternary bg-prim text-invert-1 placeholder:text-invert-4 focus:border-invert-4 rounded-md border px-3 py-2 outline-none"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-invert-4 text-xs">apiTokenInstance</span>
          <input
            name="apiTokenInstance"
            type="password"
            required
            autoComplete="current-password"
            placeholder="*************"
            className="border-quaternary bg-prim text-invert-1 placeholder:text-invert-4 focus:border-invert-4 rounded-md border px-3 py-2 outline-none"
          />
        </label>

        <label className="text-invert-1 flex items-center gap-2 text-sm">
          <input
            name="remember"
            type="checkbox"
            className="accent-lime size-4"
          />
          Запомнить меня
        </label>

        <div className="mt-1 flex flex-col gap-2">
          <button type="submit" className="mx-auto w-fit">
            Подключиться
          </button>
          <p className="text-invert-4 text-center text-xs">
            idInstance и токен сохранятся только в этом браузере и пойдут в
            запросы к GREEN-API. С «Запомнить меня» они останутся после закрытия
            вкладки, иначе — только в текущей сессии.
          </p>
        </div>
      </form>
    </main>
  )
}
