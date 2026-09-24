import { useState, useRef, useEffect } from 'react'
import type { CartItem } from '../App'
import { useAuth } from '../context/AuthContext'
import { sendChatMessage, type ChatTurn } from '../lib/chatApi'

type Message = {
  id: number
  role: 'user' | 'assistant'
  text: string
  time: string
  agentLabel?: string
  isError?: boolean
}

type Props = {
  cartItems: CartItem[]
}

const suggestions = [
  'Recommend desserts for a birthday party',
  'Suggest pastries for a family gathering',
  'Help me create a dessert tray',
  'Find treats similar to my previous orders',
  'Recommend the best subscription plan',
  'What seasonal items are available now?',
]

function formatTime() {
  const now = new Date()
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const WELCOME_ID = 0

export default function Concierge({ cartItems }: Props) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: WELCOME_ID,
      role: 'assistant',
      text: "👋 Hello! I'm your bakery concierge. I can recommend treats, plan desserts for a party, suggest add-ons for your cart, help with allergies and dietary needs, or check on an order.",
      time: formatTime(),
      agentLabel: 'Orchestrator Agent',
    },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const send = async (text: string) => {
    if (!text.trim() || typing) return

    const userMsg: Message = { id: Date.now(), role: 'user', text: text.trim(), time: formatTime() }
    // The welcome message and error notices are UI-only, so they are not sent to the model.
    const history: ChatTurn[] = [...messages, userMsg]
      .filter(m => m.id !== WELCOME_ID && !m.isError)
      .map(m => ({ role: m.role, content: m.text }))

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setTyping(true)

    try {
      const result = await sendChatMessage({
        role: 'customer',
        messages: history,
        customerId: user?.username,
        cart: cartItems,
        tasteProfile: user?.tasteProfile,
      })
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        text: result.reply,
        time: formatTime(),
        agentLabel: result.agent.label,
      }])
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        text: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
        time: formatTime(),
        isError: true,
      }])
    } finally {
      setTyping(false)
    }
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto px-6 py-8" style={{ height: 'calc(100vh - 64px)' }}>
      <div className="mb-6 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-3 shadow-md" style={{ background: 'var(--primary)' }}>
          🥐
        </div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Fraunces, serif' }}>AI Dessert Concierge</h1>
        <p className="mt-2 text-base" style={{ color: 'var(--muted-foreground)' }}>
          Routed by an AI orchestrator to specialized bakery agents for recommendations, party planning, cart help, dietary guidance, and support.
        </p>
      </div>

      <div className="flex-1 rounded-3xl border overflow-hidden flex flex-col" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-lg mt-1" style={{ background: 'var(--primary)' }}>
                  🥐
                </div>
              )}
              <div className={`flex flex-col gap-1 max-w-[82%] ${msg.role === 'user' ? 'items-end' : ''}`}>
                <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line" style={{
                  background: msg.role === 'user' ? 'var(--primary)' : msg.isError ? '#FFF0F0' : 'var(--muted)',
                  color: msg.role === 'user' ? 'white' : msg.isError ? '#C0392B' : 'var(--foreground)',
                  borderBottomRightRadius: msg.role === 'user' ? '4px' : undefined,
                  borderBottomLeftRadius: msg.role === 'assistant' ? '4px' : undefined,
                }}>
                  {msg.text}
                </div>

                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  {msg.time}
                  {msg.role === 'assistant' && msg.agentLabel && ` · ${msg.agentLabel}`}
                </span>
              </div>
            </div>
          ))}

          {typing && (
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-lg" style={{ background: 'var(--primary)' }}>🥐</div>
              <div className="px-4 py-3 rounded-2xl" style={{ background: 'var(--muted)' }}>
                <span className="inline-flex gap-1">
                  <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--muted-foreground)', animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--muted-foreground)', animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--muted-foreground)', animationDelay: '300ms' }} />
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {messages.length <= 1 && (
          <div className="px-6 pb-4">
            <div className="text-xs font-semibold mb-2" style={{ color: 'var(--muted-foreground)' }}>SUGGESTED QUESTIONS</div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map(s => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  disabled={typing}
                  className="px-3 py-2 rounded-xl text-sm font-medium border transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
                  style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="border-t p-4 flex gap-3" style={{ borderColor: 'var(--border)' }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send(input)}
            placeholder="Ask about treats, events, allergies, your cart, or an order…"
            aria-label="Message the bakery concierge"
            className="flex-1 px-4 py-3 rounded-2xl border text-sm outline-none"
            style={{ background: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || typing}
            aria-label="Send message"
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white transition hover:opacity-90 disabled:opacity-40"
            style={{ background: 'var(--primary)' }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
