type ToastListener = (message: string) => void

let listener: ToastListener | null = null

export function showToast(message: string) {
  listener?.(message)
}

export function subscribeToasts(next: ToastListener) {
  listener = next
  return () => {
    if (listener === next) listener = null
  }
}
