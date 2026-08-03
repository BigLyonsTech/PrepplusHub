import { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MessageCircle, X, Send } from 'lucide-react'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

const GREETING = "Hi! I'm the PrepplusHub support assistant. Ask me anything about buying, selling, or how the platform works."

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const listRef = useRef(null)

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages, loading])

  async function handleSend(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    const nextMessages = [...messages, { role: 'user', content: text }]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await api.chat({ message: text, history: nextMessages })
      setMessages((cur) => [...cur, { role: 'assistant', content: res.reply }])
    } catch {
      setMessages((cur) => [
        ...cur,
        { role: 'assistant', content: "Sorry, something went wrong. Please try again." },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="w-[min(360px,calc(100vw-2.5rem))] h-[min(480px,calc(100vh-8rem))] bg-surface rounded-3xl border border-onLight/10 shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="bg-ink text-onDark px-5 py-4 flex items-center justify-between shrink-0">
              <div>
                <div className="font-display font-semibold text-sm">PrepplusHub Support</div>
                <div className="text-xs text-onDark/50">Usually replies in a few seconds</div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Close chat"
              >
                <X size={16} />
              </button>
            </div>

            <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-paper">
              <div className="max-w-[85%] bg-surface border border-onLight/10 rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-sm text-onLight/80">
                {GREETING}
              </div>
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn('max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm', {
                    'ml-auto bg-leaf text-white rounded-br-sm': m.role === 'user',
                    'bg-surface border border-onLight/10 text-onLight/80 rounded-bl-sm':
                      m.role === 'assistant',
                  })}
                >
                  {m.content}
                </div>
              ))}
              {loading && (
                <div className="bg-surface border border-onLight/10 rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-sm text-onLight/40 w-fit">
                  Thinking…
                </div>
              )}
            </div>

            <form onSubmit={handleSend} className="border-t border-onLight/10 p-3 flex gap-2 shrink-0">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question…"
                className="flex-1 h-10 px-3.5 rounded-full border border-onLight/15 bg-paper text-sm outline-none focus:border-leaf focus:ring-1 focus:ring-leaf"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="size-10 shrink-0 rounded-full bg-leaf text-white flex items-center justify-center disabled:opacity-40 hover:bg-leaf-dim transition-colors"
                aria-label="Send"
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((v) => !v)}
        className="size-14 rounded-full bg-leaf text-white shadow-lg shadow-leaf/30 flex items-center justify-center"
        aria-label={open ? 'Close support chat' : 'Open support chat'}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </motion.button>
    </div>
  )
}
