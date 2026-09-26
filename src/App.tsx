import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import {
  createBrowserRouter,
  Outlet,
  redirect,
  RouterProvider,
} from "react-router-dom"
import { Auth } from "./auth/Auth"
import { Chat } from "./chat/opened-chat/Chat"
import { NoChat } from "./chat/opened-chat/NoChat"
import { CreateChat } from "./chat/create-chat/CreateChat"
import { getCredentials } from "./auth/credentials"
import { ChatWrap } from "./chat/ChatWrap"

const queryClient = new QueryClient()

const router = createBrowserRouter([
  {
    path: "/auth",
    loader: () => {
      if (getCredentials()) return redirect("/")
      return null
    },
    element: <Auth />,
  },
  {
    path: "/",
    loader: () => {
      if (!getCredentials()) return redirect("/auth")
      return null
    },
    element: <Outlet />,
    children: [
      {
        element: <ChatWrap />,
        children: [
          { index: true, element: <NoChat /> },
          { path: "chats/new", element: <CreateChat /> },
          { path: "chats/:chatId", element: <Chat /> },
        ],
      },
    ],
  },
])

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

export default App
