import { useGetAvatar } from "./getAvatar"

export function Avatar({ chatId, name }: { chatId: string; name: string }) {
  const { data } = useGetAvatar(chatId)
  const url = data?.urlAvatar
  return url ? (
    <img
      src={url}
      alt=""
      className="size-10 shrink-0 rounded-full object-cover"
    />
  ) : (
    <span className="bg-second text-invert-1 border-quaternary flex size-10 shrink-0 items-center justify-center rounded-full border text-sm">
      {(name || "?").slice(0, 1).toUpperCase()}
    </span>
  )
}
