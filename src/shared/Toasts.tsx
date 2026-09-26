import { useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { subscribeToasts } from "./showToast"

type ToastProps = {
  message: string
  open: boolean
  durationMs?: number
  onClose: () => void
}

export function Toast({
  message,
  open,
  durationMs = 5000,
  onClose,
}: ToastProps) {
  const toastRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!open) return
    const timer = window.setTimeout(onClose, durationMs)
    return () => window.clearTimeout(timer)
  }, [open, durationMs, onClose])

  useEffect(() => {
    const node = toastRef.current
    if (!open || !node) return
    if (!node.matches(":popover-open")) node.showPopover()
    return () => {
      if (node.isConnected && node.matches(":popover-open")) node.hidePopover()
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <aside
      ref={toastRef}
      popover="manual"
      role="status"
      style={{
        inset: "auto",
        top: "var(--space-v)",
        left: "50%",
        margin: 0,
        transform: "translateX(-50%)",
      }}
      className="rounded-2 border-quaternary bg-second px-h py-v-half text-invert-1 fixed z-(--z-toasts) w-fit max-w-[min(24rem,calc(100vw-2*var(--space-h)))] border text-center"
    >
      {message}
    </aside>,
    document.body,
  )
}

export function Toasts() {
  const [toast, setToast] = useState<{ id: number; message: string } | null>(
    null,
  )
  const close = useCallback(() => setToast(null), [])

  useEffect(
    () => subscribeToasts((message) => setToast({ id: Date.now(), message })),
    [],
  )

  return (
    <Toast
      key={toast?.id}
      message={toast?.message ?? ""}
      open={toast !== null}
      onClose={close}
    />
  )
}
