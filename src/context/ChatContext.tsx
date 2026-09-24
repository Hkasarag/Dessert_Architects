import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import type { CartItem } from '../App'
import type { TasteProfile } from './AuthContext'
import { sendChatMessage, type ChatRole, type ChatTurn } from '../lib/chatApi'

export type ChatId = 'concierge' | 'franchise'

export type ChatMessage = {
  id: number
  role: 'user' | 'assistant'
  text: string
  time: string
  agentLabel?: string
  isError?: boolean
  /** UI-only greeting; never sent to the model. */
  isWelcome?: boolean
}

type Conversation = {
  messages: ChatMessage[]
  pending: boolean
}

/** Per-request details sent with the conversation. Read at send time so the agent sees the latest cart. */
export type ChatRequest = {
  role: ChatRole
  customerId?: string
  cart?: CartItem[]
  tasteProfile?: TasteProfile
}

type ChatContextType = {
  conversations: Record<ChatId, Conversation>
  send: (chatId: ChatId, text: string, request: ChatRequest) => Promise<void>
}

export const formatChatTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

const initialConversations = (): Record<ChatId, Conversation> => ({
  concierge: {
    pending: false,
    messages: [{
      id: 0,
      role: 'assistant',
      text: "👋 Hello! I'm your bakery concierge. I can recommend treats, plan desserts for a party, suggest add-ons for your cart, help with allergies and dietary needs, or check on an order.",
      time: formatChatTime(),
      agentLabel: 'Orchestrator Agent',
      isWelcome: true,
    }],
  },
  franchise: { pending: false, messages: [] },
})

const ChatContext = createContext<ChatContextType | null>(null)

/**
 * Keeps chat conversations alive while the user navigates between pages.
 * Mount it only while a user is signed in, so signing out clears the chats.
 */
export function ChatProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState(initialConversations)
  const conversationsRef = useRef(conversations)
  conversationsRef.current = conversations
  const pendingRef = useRef(new Set<ChatId>())
  const nextId = useRef(1)

  const append = (chatId: ChatId, message: Omit<ChatMessage, 'id'>, pending: boolean) => {
    const withId = { ...message, id: nextId.current++ }
    setConversations(prev => ({
      ...prev,
      [chatId]: { messages: [...prev[chatId].messages, withId], pending },
    }))
  }

  const send = useCallback(async (chatId: ChatId, text: string, request: ChatRequest) => {
    const trimmed = text.trim()
    if (!trimmed || pendingRef.current.has(chatId)) return
    pendingRef.current.add(chatId)

    const userMessage: Omit<ChatMessage, 'id'> = { role: 'user', text: trimmed, time: formatChatTime() }
    const history: ChatTurn[] = [...conversationsRef.current[chatId].messages, userMessage]
      .filter(m => !m.isWelcome && !m.isError)
      .map(m => ({ role: m.role, content: m.text }))
    append(chatId, userMessage, true)

    try {
      const result = await sendChatMessage({ ...request, messages: history })
      append(chatId, { role: 'assistant', text: result.reply, time: formatChatTime(), agentLabel: result.agent.label }, false)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.'
      append(chatId, { role: 'assistant', text: message, time: formatChatTime(), isError: true }, false)
    } finally {
      pendingRef.current.delete(chatId)
    }
  }, [])

  return <ChatContext.Provider value={{ conversations, send }}>{children}</ChatContext.Provider>
}

export function useChat(chatId: ChatId) {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used inside ChatProvider')
  const { messages, pending } = ctx.conversations[chatId]
  const send = (text: string, request: ChatRequest) => ctx.send(chatId, text, request)
  return { messages, pending, send }
}
