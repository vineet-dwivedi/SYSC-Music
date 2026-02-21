import { useCallback, useState } from 'react'

function useToastManager() {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, tone = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
    setToasts((prev) => [...prev, { id, message, tone }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 1500)
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return { addToast, dismissToast, toasts }
}

export { useToastManager }
