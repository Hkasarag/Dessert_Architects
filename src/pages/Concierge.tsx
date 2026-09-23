import { useState, useRef, useEffect } from 'react'

type Message = {
  id: number
  role: 'user' | 'assistant'
  text: string
  time: string
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
  birthday:
    "🎂 For a birthday celebration, I'd recommend a mix of our most popular treats: **Chocolate Chip Cookies**, **Chocolate Brownies**, and **Vanilla Cupcakes**. If you're celebrating during the current season, adding a few seasonal specialties like our **Carrot Cupcake**, **Pumpkin Brownie**, or **Peppermint Chocolate Cupcake** can make the dessert table even more memorable. Would you like recommendations based on your guest count?",

  family:
    "🏡 For a family gathering, our **Cinnamon Rolls** are always a crowd favorite, especially for brunches and morning events. Pair them with **Chocolate Chip Cookies**, **Snickerdoodle Cookies**, and **Chocolate Brownies** for a variety of flavors everyone can enjoy. If anyone prefers plant-based options, our **Vegan Banana Bread Muffin** is a great addition.",

  'dessert tray':
    "🍰 For a balanced dessert tray, I'd recommend **Chocolate Chip Cookies**, **Snickerdoodle Cookies**, **Chocolate Brownies**, **Walnut Brownies**, and **Vanilla Cupcakes**. This combination provides a great mix of textures and flavors, from soft cookies to rich brownies and light cupcakes. Want me to suggest quantities for a specific group size?",

  previous:
    "📋 Based on popular customer favorites, if you enjoy classic bakery treats I'd recommend our **Chocolate Chip Cookies**, **Chocolate Brownies**, and **Vanilla Cupcakes**. If you'd like to try something seasonal, check out our limited-time selections such as **Chocolate Chunk Pretzel Cookies**, **Pumpkin Brownies**, **Blueberry Cupcakes**, or **Peppermint Mocha Brownies**, depending on the time of year.",

  subscription:
    "📦 We currently don't offer a subscription program, but I'd be happy to help build a custom assortment of cookies, brownies, cupcakes, and pastries for recurring orders. Many customers enjoy creating a weekly box with a mix of **Chocolate Chip Cookies**, **Chocolate Brownies**, **Vanilla Cupcakes**, and **Cinnamon Rolls**.",

  seasonal:
    "🍂 Our seasonal menu changes throughout the year. Seasonal favorites include **Almond Fudge Cookies** and **Strawberry Blondies** in Spring, **Peach Cobbler Sugar Cookies** and **Smores Brownies** in Summer, **Chocolate Chunk Pretzel Cookies**, **Pumpkin Brownies**, and **Carrot Cupcakes** in Fall, and **Gingerbread Cookies**, **Peppermint Mocha Brownies**, and **Peppermint Chocolate Cupcakes** in Winter. Seasonal availability depends on the current season.",
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

export default function Concierge() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: 'assistant',
      text: "👋 Hello! I'm your Bakery Concierge, here to help you discover the perfect treats. Whether you're planning a celebration, browsing for yourself, or looking for the best subscription — I'm here to help. What can I find for you today?",
      time: formatTime(),
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
      setTyping(false)
      const resp: Message = { id: Date.now() + 1, role: 'assistant', text: getResponse(text), time: formatTime() }
      setMessages(prev => [...prev, resp])
    }, 1200)
  }

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto px-6 py-8" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Header */}
      <div className="mb-6 text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-3 shadow-md"
          style={{ background: 'var(--primary)' }}
        >
          🥐
        </div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Fraunces, serif' }}>How Can I Help Today?</h1>
        <p className="mt-2 text-base" style={{ color: 'var(--muted-foreground)' }}>
          Your personal bakery assistant is here to find the perfect treats, subscriptions, and recommendations.
        </p>
      </div>

      {/* Chat */}
      <div
        className="flex-1 rounded-3xl border overflow-hidden flex flex-col"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {msg.role === 'assistant' && (
                <div
                  className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-lg mt-1"
                  style={{ background: 'var(--primary)' }}
                >🥐</div>
              )}
              <div className={`flex flex-col gap-1 max-w-[80%] ${msg.role === 'user' ? 'items-end' : ''}`}>
                <div
                  className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                  style={{
                    background: msg.role === 'user' ? 'var(--primary)' : 'var(--muted)',
                    color: msg.role === 'user' ? 'white' : 'var(--foreground)',
                    borderBottomRightRadius: msg.role === 'user' ? '4px' : undefined,
                    borderBottomLeftRadius: msg.role === 'assistant' ? '4px' : undefined,
                  }}
                >
                  {msg.text.split('**').map((part, i) =>
                    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                  )}
                </div>
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

        {/* Suggestions */}
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

        {/* Input */}
        <div className="border-t p-4 flex gap-3" style={{ borderColor: 'var(--border)' }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send(input)}
            placeholder="Ask about treats, recommendations, subscriptions…"
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
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
