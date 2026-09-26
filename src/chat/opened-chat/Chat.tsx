import { useLayoutEffect, useRef, useState } from "react"
import { useGetChatHistory } from "./getChatHistory"
import { Link, useParams } from "react-router-dom"
import { Composer } from "./Composer"
import { Avatar } from "../../user/avatar/Avatar"
import { Skeleton } from "../../shared/Skeleton"
import { useInterlocutor } from "../chat-list/useInterlocutor"

export function Chat() {
  const { chatId } = useParams<{ chatId: string }>()
  const {
    data: chatHistory,
    isLoading: chatHistoryLoading,
    error,
  } = useGetChatHistory(chatId)
  const { data: contact, isLoading: nameLoading } = useInterlocutor(chatId)
  const showNameSkeleton = nameLoading && !contact?.name
  const listRef = useRef<HTMLDivElement>(null)
  const stickToBottomRef = useRef(true)
  const [hasNewMessages, setHasNewMessages] = useState(false)

  const messages = chatHistory ? [...chatHistory].reverse() : []
  const latest = messages.at(-1)
  const latestId = latest?.idMessage
  const latestIsMine = latest?.type === "outgoing"

  useLayoutEffect(() => {
    stickToBottomRef.current = true
    setHasNewMessages(false)
  }, [chatId])

  useLayoutEffect(() => {
    const el = listRef.current
    if (!el || !latestId) return
    if (latestIsMine) stickToBottomRef.current = true
    if (!stickToBottomRef.current) {
      setHasNewMessages(true)
      return
    }
    setHasNewMessages(false)
    el.scrollTop = el.scrollHeight
  }, [chatId, latestId, latestIsMine, messages.length])

  function handleScroll(event: React.UIEvent<HTMLDivElement>) {
    const el = event.currentTarget
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    const atBottom = distanceFromBottom < 80
    stickToBottomRef.current = atBottom
    if (atBottom) setHasNewMessages(false)
  }

  function scrollToBottom() {
    const el = listRef.current
    stickToBottomRef.current = true
    setHasNewMessages(false)
    if (el) el.scrollTop = el.scrollHeight
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
        {showNameSkeleton ? (
          <Skeleton className="size-10 shrink-0 rounded-full" />
        ) : (
          <Avatar chatId={chatId ?? ""} name={contact?.name || ""} />
        )}
        <div className="min-w-0">
          {showNameSkeleton ? (
            <>
              <Skeleton className="h-4 w-28" />
              <Skeleton className="mt-1 h-3 w-40" />
            </>
          ) : (
            <>
              <div>{contact?.name}</div>
              <small className="text-invert-3">{chatId}</small>
            </>
          )}
        </div>
      </header>
      <div className="relative min-h-0 flex-1">
        <div
          ref={listRef}
          className="absolute inset-0 overflow-x-hidden overflow-y-auto"
          onScroll={handleScroll}
        >
          {error && <div className="p-2">Ошибка: {error.message}</div>}
          {chatHistoryLoading && !chatHistory ? (
            <ul
              aria-busy="true"
              className="m-0 flex min-h-full list-none flex-col justify-end gap-1 p-2"
            >
              {[
                "self-start w-40",
                "self-end w-56",
                "self-start w-64",
                "self-end w-36",
                "self-start w-48",
              ].map((shape) => (
                <li key={shape}>
                  <Skeleton className={`h-10 ${shape}`} />
                </li>
              ))}
            </ul>
          ) : (
            <ul className="m-0 flex min-h-full list-none flex-col justify-end gap-1 p-2">
              {messages.map((message) => (
                <li
                  key={message.idMessage}
                  className={[
                    "flex w-fit max-w-xl items-center gap-2 rounded-md p-2 break-words",
                    message.type === "incoming"
                      ? "bg-second text-invert-1 self-start"
                      : "bg-mint text-invert-mint self-end",
                    message.statusMessage === "pending" ? "opacity-60" : "",
                  ].join(" ")}
                >
                  <div>{message?.textMessage}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {hasNewMessages && (
          <button
            type="button"
            onClick={scrollToBottom}
            className="border-quaternary bg-second text-invert-1 absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border px-3 py-1 text-sm"
          >
            Новые сообщения
          </button>
        )}
      </div>
      <Composer />
    </section>
  )
}
