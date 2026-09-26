import {
  useRef,
  type InputEvent,
  type KeyboardEvent,
  type SubmitEvent,
} from "react"
import { useParams } from "react-router-dom"
import { useSendMessage } from "./sendMessage"

export function Composer() {
  const { chatId } = useParams<{ chatId: string }>()
  const { mutate, isPending, error } = useSendMessage()

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!chatId) return

    const form = event.currentTarget
    const formData = new FormData(form)
    const message = String(formData.get("message") ?? "").trim()
    if (!message) return

    mutate({ chatId, message })
    form.reset()
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  function resizeOnInput(event: InputEvent<HTMLTextAreaElement>) {
    const el = event.currentTarget
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 172)}px`
  }

  function handleSubmitWithReturn(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      event.currentTarget.form?.requestSubmit()
    }
  }

  return (
    <div className="border-quaternary flex shrink-0 items-end gap-2 border-t p-2">
      <form onSubmit={handleSubmit} className="flex w-full items-end gap-2">
        <textarea
          ref={textareaRef}
          name="message"
          rows={1}
          className="max-h-44 min-h-12 w-full resize-none overflow-y-auto border-0 bg-transparent outline-0"
          placeholder="Сообщение"
          disabled={!chatId}
          onInput={resizeOnInput}
          onKeyDown={handleSubmitWithReturn}
        />
        <button type="submit" disabled={isPending || !chatId}>
          Отправить
        </button>
      </form>
      {error && <p>{error.message}</p>}
    </div>
  )
}
