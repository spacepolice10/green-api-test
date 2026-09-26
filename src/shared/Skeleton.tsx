export function Skeleton({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={["rounded-2 bg-quaternary block animate-pulse", className]
        .filter(Boolean)
        .join(" ")}
    />
  )
}
