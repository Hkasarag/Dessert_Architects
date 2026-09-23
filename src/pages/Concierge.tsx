import { useState, useRef, useEffect } from 'react'
import {
  executeAgentByIntent,
  routeCustomerIntent,
  type AgentIntent,
} from '../agents/router'

type Message = {
  id: number
  role: 'user' | 'assistant'
  text: string
  time: string
  agentLabel?: string
  jsonPayload?: string
}

const suggestions = [
  'What desserts should I get today?',
  'What deals do you have?',
  'I need desserts for 40 guests and a budget of $180.',
  'What should I reorder?',
  'Where is my order?',
  'Do you have any peanut-free options?',
]

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
  const intentLabel = summarizeIntent(route.intent)
  const summaryMap: Record<AgentIntent, string> = {
    product_recommendation: 'Recommended desserts based on customer behavior and verified catalog data.',
    promotion_recommendation: 'Relevant active promotions matched to the customer profile and prior buying behavior.',
    party_planning: 'Event order recommendation built from guest count, budget, and product pricing.',
    franchise_reordering: 'Inventory reorder guidance based on safety stock, lead time, and sales velocity.',
    customer_service: 'Support response grounded in order and policy data only.',
    cart_optimization: 'Upsell and cross-sell recommendations based on basket affinity and inventory-backed products.',
    nutritional_allergy: 'Restricted-ingredient filtering to recommend safe products only.',
    clarification_required: 'The request needs a bit more clarification before routing.',
  }

  const summary = summaryMap[route.intent]
  const json = JSON.stringify(result, null, 2)

  return {
    text: `${summary}\n\nRoute: ${intentLabel}\nConfidence: ${route.confidence.toFixed(2)}`,
    jsonPayload: json,
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
      const assistantResponse = renderStructuredResponse(route, result)

      const resp: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        text: assistantResponse.text,
        time: formatTime(),
        agentLabel: assistantResponse.agentLabel,
        jsonPayload: assistantResponse.jsonPayload,
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
