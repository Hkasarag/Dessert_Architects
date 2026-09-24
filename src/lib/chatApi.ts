import type { CartItem } from '../App'
import type { TasteProfile } from '../context/AuthContext'

const API_BASE_URL = 'http://localhost:5050'

export type ChatRole = 'customer' | 'admin'

export type ChatTurn = {
  role: 'user' | 'assistant'
  content: string
}

export type ChatReply = {
  reply: string
  agent: { id: string; label: string }
}

type SendChatParams = {
  role: ChatRole
  messages: ChatTurn[]
  customerId?: string
  cart?: CartItem[]
  tasteProfile?: TasteProfile
}

/** Sends the conversation to the server-side agent orchestrator (Azure OpenAI). */
export async function sendChatMessage({ role, messages, customerId, cart, tasteProfile }: SendChatParams): Promise<ChatReply> {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      role,
      messages,
      customerId,
      tasteProfile,
      cart: cart?.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        isSubscription: item.isSubscription ?? false,
      })),
    }),
  })

  const result = await response.json().catch(() => null)
  if (!response.ok || !result) {
    throw new Error(result?.error || 'The concierge is unavailable right now. Please try again.')
  }
  return result as ChatReply
}
