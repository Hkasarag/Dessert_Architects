import { useState, useRef, useEffect } from 'react'
import {
  executeAgentByIntent,
  routeCustomerIntent,
  type AgentIntent,
} from '../agents/router'
import { formatAgentResponse } from '../agents/responseFormatter'

type Message = {
  id: number
  role: 'user' | 'assistant'
  text: string
  time: string
  agentLabel?: string
  jsonPayload?: string
}

const suggestions = [
  'Recommend desserts for a birthday party',
  'Suggest pastries for a family gathering',
  'Help me create a dessert tray',
  'Find treats similar to my previous orders',
  'Recommend the best subscription plan',
  'What seasonal items are available now?',
]

const responses: Record<string, string> = {
  'birthday': "🎂 Great choice! For a birthday party, I'd recommend our **Classic Birthday Cake (10-inch)** — it serves 16–20 guests and can be custom decorated. Pair it with our **Funfetti Cupcakes** for color and our **Macarons (6-pack)** as elegant party favors. That combination is our most popular birthday order. Shall I add any of these to your cart?",
  'family': "🏡 For a family gathering, our **Family Celebration Package** is perfect — it includes a custom cake and 2 dozen mini cupcakes. I'd also suggest adding our **Butter Croissants** and **Cinnamon Rolls** for morning arrivals. Based on your order history, your family loves chocolate, so our **Dark Chocolate Brownies** would be a crowd-pleaser!",
  'dessert tray': "🍰 A beautiful dessert tray! Here's what I recommend for variety and visual impact: **Macarons** (assorted colors), **Dark Chocolate Brownies** (cut into squares), **Snickerdoodles**, and **Lemon Scones** with clotted cream. This gives you 4 textures and flavor profiles that complement each other. Shall I build this order for you?",
  'previous': "📋 Looking at your order history, you frequently order **Chocolate Chip Cookies**, **Birthday Cakes**, and **Croissants**. Since it's fall, I'd suggest trying our new **Pumpkin Spice Cake** — it's similar to your usual Birthday Cake order but with seasonal spices. Our **Apple Cider Donuts** are also new and I think you'll love them!",
  'subscription': "📦 Based on your ordering frequency (about weekly), the **Family Favorites Plan** at $49/month is your best value — you're already spending about $60/week! It includes 8 treats weekly, 15% off all orders, and free delivery. If you'd like more variety, the **Bakery VIP Club** gives you early access to seasonal items. Which sounds right for your family?",
  'seasonal': "🍂 This fall, we're featuring: **Pumpkin Spice Cake** (a customer favorite!), **Apple Cider Donuts**, **Peppermint Bark** (getting an early start!), and our special **Holiday Dessert Tray** with gingerbread and yule log. All seasonal items sell out quickly — subscribers get first access. Want me to set up a notification?",
}

function getResponse(input: string): string {
  const lower = input.toLowerCase()
  for (const [key, resp] of Object.entries(responses)) {
    if (lower.includes(key)) return resp
  }
  return "🥐 That's a wonderful question! Let me help you find the perfect treats. Based on our bakery's menu and your preferences, I'd suggest starting with our **Personalized Recommendations** on the home page — I've tailored those selections just for you. You can also browse by category in the full menu. Is there a specific occasion, flavor, or dietary preference I can help narrow down?"
}

function formatTime() {
  const now = new Date()
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function summarizeIntent(intent: AgentIntent) {
  const labels: Record<AgentIntent, string> = {
    product_recommendation: 'Product Recommendation Agent',
    promotion_recommendation: 'Promotion Recommendation Agent',
    party_planning: 'Party Planner Agent',
    franchise_reordering: 'Franchise Reordering Agent',
    customer_service: 'Customer Service Agent',
    cart_optimization: 'Cart Optimization Agent',
    nutritional_allergy: 'Nutritional & Allergy Agent',
    clarification_required: 'Orchestrator Agent',
  }

  return labels[intent]
}

function renderStructuredResponse(route: ReturnType<typeof routeCustomerIntent>, result: unknown) {
  // kept for backward compatibility; not used after switching to formatAgentResponse
  const intentLabel = summarizeIntent(route.intent)
  return {
    text: `Routed to: ${intentLabel} — ${route.rationale}`,
    jsonPayload: undefined,
    agentLabel: intentLabel,
  }
}

export default function Concierge() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: 'assistant',
      text: "👋 Hello! I’m your bakery concierge and orchestrator. I can route your request to the right specialist agent for recommendations, promotions, event planning, inventory, order support, or dietary guidance.",
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

  const send = (text: string) => {
    if (!text.trim()) return

    const userMsg: Message = { id: Date.now(), role: 'user', text, time: formatTime() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setTyping(true)

    setTimeout(() => {
      const route = routeCustomerIntent(text)
      const result = executeAgentByIntent(route.intent, text, 'customer')
      const formatted = formatAgentResponse(route, result)

      const resp: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        text: formatted,
        time: formatTime(),
        agentLabel: summarizeIntent(route.intent),
      }

      setTyping(false)
      setMessages(prev => [...prev, resp])
    }, 1000)
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto px-6 py-8" style={{ height: 'calc(100vh - 64px)' }}>
      <div className="mb-6 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-3 shadow-md" style={{ background: 'var(--primary)' }}>
          🥐
        </div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Fraunces, serif' }}>AI Dessert Concierge</h1>
        <p className="mt-2 text-base" style={{ color: 'var(--muted-foreground)' }}>
          Routed by an orchestrator to specialized bakery agents for products, promotions, party planning, and support.
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
                  background: msg.role === 'user' ? 'var(--primary)' : 'var(--muted)',
                  color: msg.role === 'user' ? 'white' : 'var(--foreground)',
                  borderBottomRightRadius: msg.role === 'user' ? '4px' : undefined,
                  borderBottomLeftRadius: msg.role === 'assistant' ? '4px' : undefined,
                }}>
                  {msg.text}
                </div>

                {msg.jsonPayload && (
                  <div className="w-full overflow-x-auto rounded-2xl border p-3 text-[11px] leading-5" style={{ background: '#111827', color: '#f3f4f6', borderColor: 'var(--border)' }}>
                    <div className="mb-2 font-semibold text-[10px] uppercase tracking-wide" style={{ color: '#fbbf24' }}>{msg.agentLabel}</div>
                    <pre className="whitespace-pre-wrap break-words m-0">{msg.jsonPayload}</pre>
                  </div>
                )}

                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{msg.time}</span>
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
            placeholder="Ask about treats, recommendations, subscriptions, events, or inventory…"
            className="flex-1 px-4 py-3 rounded-2xl border text-sm outline-none"
            style={{ background: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim()}
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
