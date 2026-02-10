function ToastStack({ toasts, onDismiss }) {
  return (
    <div className="toast-stack" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast--${toast.tone}`} role="status">
          <span className="toast__message">{toast.message}</span>
          <button
            className="toast__close"
            type="button"
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss notification"
          >
            <span className="icon icon--close" />
          </button>
        </div>
      ))}
    </div>
  )
}

export default ToastStack
