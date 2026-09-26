import type { CSSProperties } from "react"
import { Link, NavLink, useMatch } from "react-router-dom"

declare module "react" {
  interface AnchorHTMLAttributes<T> {
    interestfor?: string
  }
}
import { Avatar } from "../../user/avatar/Avatar"
import { useGetChats } from "./getChatList"
import { useLatestPreviews } from "./useLatestPreviews"
import { Skeleton } from "../../shared/Skeleton"
import { User } from "../../user/User"

export function ChatList() {
  const onList = Boolean(useMatch({ path: "/", end: true }))
  const { data: chats, isLoading, error } = useGetChats()
  const { data: previews } = useLatestPreviews()

  return (
    <aside
      className={[
        "md:border-quaternary min-h-0 shrink-0 flex-col md:w-1/4 md:border-r",
        onList ? "flex w-full" : "hidden md:flex",
      ].join(" ")}
    >
      <div className="min-h-0 flex-1 overflow-y-auto px-2">
        <div className="my-4 flex items-center justify-between gap-2 pr-4">
          <h1 className="text-4xl font-bold">Чаты</h1>
          {!onList && (
            <div
              className="contents"
              style={{ "--hint-anchor": "--new-chat-hint" } as CSSProperties}
            >
              <Link
                to="/chats/new"
                replace
                aria-label="Новый чат"
                interestfor="new-chat-hint"
                className="bg-invert-1 text-prim hover:bg-invert-2 rounded-2 flex size-10 shrink-0 items-center justify-center"
              >
                <span className="icon-wrap">
                  <span className="icon icon-plus" />
                </span>
              </Link>
              <span id="new-chat-hint" popover="hint">
                Новый чат
              </span>
            </div>
          )}
        </div>
        {isLoading && !chats && (
          <ul
            aria-busy="true"
            className="m-0 flex list-none flex-col gap-1 pr-4"
          >
            {["w-3/5", "w-2/5", "w-4/5", "w-1/2", "w-2/3"].map((width) => (
              <li
                key={width}
                className="flex items-center gap-2 rounded-md p-2"
              >
                <Skeleton className="size-10 shrink-0 rounded-full" />
                <Skeleton className={`h-4 ${width}`} />
              </li>
            ))}
          </ul>
        )}
        {error && <div>Ошибка: {error.message}</div>}
        {chats && (
          <ul className="m-0 flex list-none flex-col gap-1 pr-4">
            {chats.map((chat) => {
              const preview = previews?.[chat.chatId]
              return (
                <li key={chat.chatId}>
                  <NavLink
                    className="bg-second hover:bg-tertiary [&.active]:bg-tertiary flex w-full items-center gap-2 rounded-md p-2"
                    to={`/chats/${chat.chatId}`}
                    replace={!onList}
                    end
                  >
                    <Avatar
                      chatId={chat.chatId}
                      name={chat.name || chat.chatId}
                    />
                    <span className="min-w-0">
                      <span className="block truncate">
                        {chat.name || chat.chatId}
                      </span>

                      <span className="text-invert-3 block h-5 truncate text-sm">
                        {preview && preview.textMessage}
                      </span>
                    </span>
                  </NavLink>
                </li>
              )
            })}
          </ul>
        )}
      </div>
      <footer className="border-quaternary shrink-0 border-t px-2 py-2">
        <User />
      </footer>
    </aside>
  )
}
