import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const ToastContext = createContext(null)

const TONE = {
  error: { icon: AlertCircle, className: 'border-coral/25 text-coral' },
  success: { icon: CheckCircle2, className: 'border-emerald/25 text-emerald' },
}

let nextId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())

  const dismiss = useCallback((id) => {
    setToasts((cur) => cur.filter((t) => t.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const showToast = useCallback(
    (message, type = 'error') => {
      const id = ++nextId
      setToasts((cur) => [...cur, { id, message, type }])
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), 5000),
      )
      return id
    },
    [dismiss],
  )

  return (
    <ToastContext.Provider value={{ showToast, dismiss }}>
      {children}
      <div className="fixed top-20 left-4 right-4 sm:left-auto sm:right-4 z-[100] flex flex-col gap-2 sm:w-[380px]">
        <AnimatePresence>
          {toasts.map((t) => {
            const tone = TONE[t.type] || TONE.error
            const Icon = tone.icon
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: -10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.97 }}
                transition={{ duration: 0.18 }}
                className={cn(
                  'flex items-start gap-2.5 rounded-2xl border bg-surface px-4 py-3 shadow-lg text-sm',
                  tone.className,
                )}
                role={t.type === 'error' ? 'alert' : 'status'}
              >
                <Icon size={18} className="shrink-0 mt-0.5" />
                <p className="flex-1 text-onLight/85">{t.message}</p>
                <button
                  onClick={() => dismiss(t.id)}
                  className="shrink-0 p-0.5 rounded-full hover:bg-onLight/10 transition-colors"
                  aria-label="Dismiss"
                >
                  <X size={14} className="text-onLight/40" />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}
