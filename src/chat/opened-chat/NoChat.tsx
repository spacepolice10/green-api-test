import { Link } from "react-router-dom"

export function NoChat() {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-invert-2 text-lg">Выберите или создайте новый чат</p>
      <Link
        to="/chats/new"
        className="bg-invert-1 text-prim hover:bg-invert-2 rounded-2 px-h py-v-half inline-flex items-center gap-2"
      >
        <span className="icon-wrap">
          <span className="icon icon-plus" />
        </span>
        Новый чат
      </Link>
    </div>
  )
}
