import { Outlet, useMatch } from "react-router-dom"
import { ChatList } from "./chat-list/ChatList"
import { NotificationPoller } from "./chat-list/NotificationPoller"
import { Toasts } from "../shared/Toasts"

export function ChatWrap() {
  const onList = useMatch({ path: "/", end: true })
  return (
    <>
      <NotificationPoller />
      <Toasts />
      <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col md:px-4 md:py-2">
        <div className="md:border-quaternary flex min-h-0 flex-1 md:rounded-md md:border">
          <ChatList />
          <div
            className={[
              "min-h-0 min-w-0 flex-col overflow-hidden",
              onList ? "hidden md:flex md:min-h-0 md:flex-1" : "flex flex-1",
            ].join(" ")}
          >
            <Outlet />
          </div>
        </div>
      </div>
    </>
  )
}
