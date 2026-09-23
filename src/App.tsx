import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar'
import TopNav from './components/TopNav'
import Home from './pages/Home'
import AdminHome from './pages/AdminHome'
import FullMenu from './pages/FullMenu'
import Cart from './pages/Cart'
import Profile from './pages/Profile'
import Concierge from './pages/Concierge'
import Subscriptions from './pages/Subscriptions'
import Analytics from './pages/Analytics'
import Inventory from './pages/Inventory'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import ThankYou from './pages/ThankYou'

export type CartItem = {
  id: number
  name: string
  price: number
  quantity: number
  image: string
  isSubscription?: boolean
}

function AuthGate() {
  const [screen, setScreen] = useState<'login' | 'signup'>('login')
  if (screen === 'signup') return <SignUp onGoLogin={() => setScreen('login')} />
  return <Login onGoSignup={() => setScreen('signup')} />
}

function AppShell() {
  const { user } = useAuth()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  if (!user) return <AuthGate />

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        if (item.isSubscription) return prev
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const updateQty = (id: number, delta: number) => {
    setCartItems(prev =>
      prev.map(i => i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i)
        .filter(i => i.quantity > 0)
    )
  }

  const removeItem = (id: number) => setCartItems(prev => prev.filter(i => i.id !== id))
  const clearCart = () => setCartItems([])

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--background)' }}>
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <TopNav cartCount={cartCount} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={
              user.role === 'admin'
                ? <AdminHome />
                : <Home addToCart={addToCart} searchQuery={searchQuery} />
            } />
            <Route path="/menu" element={<FullMenu addToCart={addToCart} searchQuery={searchQuery} />} />
            <Route path="/cart" element={<Cart items={cartItems} updateQty={updateQty} removeItem={removeItem} clearCart={clearCart} />} />
            <Route path="/thankyou" element={<ThankYou />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/concierge" element={<Concierge />} />
            <Route path="/subscriptions" element={<Subscriptions addToCart={addToCart} />} />
            {user.role === 'admin' && (
              <>
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/inventory" element={<Inventory />} />
              </>
            )}
            <Route path="*" element={
              user.role === 'admin' ? <AdminHome /> : <Home addToCart={addToCart} searchQuery={searchQuery} />
            } />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  )
}
