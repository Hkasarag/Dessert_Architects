import { createContext, useContext, useState, type ReactNode } from 'react'

export type UserRole = 'customer' | 'admin'

export type TasteProfile = {
  favoriteBakedGoods: string[]
  dietaryPreferences: string[]
  recentInterests: string[]
}

const EMPTY_TASTE_PROFILE: TasteProfile = { favoriteBakedGoods: [], dietaryPreferences: [], recentInterests: [] }

// The tags every account showed before taste profiles were stored per user.
const DEMO_TASTE_PROFILE: TasteProfile = {
  favoriteBakedGoods: ['Chocolate Treats', 'Seasonal Favorites', 'Cookies', 'Bundle Deals'],
  dietaryPreferences: ['Plant-Based Options', 'Pollen-Free Treats'],
  recentInterests: ['Fall Seasonal', 'Family Packages', 'Weekend Brunch'],
}

export type UserProfile = {
  username: string
  email: string
  phone: string
  dob: string
  address: string
  role: UserRole
  memberSince: string
  tasteProfile: TasteProfile
}

type AuthContextType = {
  user: UserProfile | null
  login: (username: string, password: string) => { ok: boolean; error?: string }
  signup: (data: SignupData) => { ok: boolean; error?: string }
  logout: () => void
}

export type SignupData = {
  username: string
  password: string
  email: string
  phone: string
  dob: string
  address: string
  role: UserRole
}

// Seeded accounts so the demo works out of the box
const SEED_ACCOUNTS: Array<SignupData & { profile: UserProfile }> = [
  {
    username: 'margaret',
    password: 'password123',
    email: 'margaret@email.com',
    phone: '+1 (555) 832-4491',
    dob: '1960-04-14',
    address: '42 Maple Lane, Springfield, IL 62701',
    role: 'customer',
    profile: {
      username: 'margaret',
      email: 'margaret@email.com',
      phone: '+1 (555) 832-4491',
      dob: '1960-04-14',
      address: '42 Maple Lane, Springfield, IL 62701',
      role: 'customer',
      memberSince: 'March 2023',
      tasteProfile: DEMO_TASTE_PROFILE,
    },
  },
  {
    username: 'admin',
    password: 'admin123',
    email: 'admin@frostedcorner.com',
    phone: '+1 (555) 000-0001',
    dob: '1985-01-01',
    address: '1 Bakery HQ Plaza, Chicago, IL 60601',
    role: 'admin',
    profile: {
      username: 'admin',
      email: 'admin@frostedcorner.com',
      phone: '+1 (555) 000-0001',
      dob: '1985-01-01',
      address: '1 Bakery HQ Plaza, Chicago, IL 60601',
      role: 'admin',
      memberSince: 'January 2020',
      tasteProfile: DEMO_TASTE_PROFILE,
    },
  },
]

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState(SEED_ACCOUNTS)
  const [user, setUser] = useState<UserProfile | null>(null)

  const login = (username: string, password: string) => {
    const match = accounts.find(
      a => a.username.toLowerCase() === username.toLowerCase() && a.password === password
    )
    if (!match) return { ok: false, error: 'Incorrect username or password.' }
    setUser(match.profile)
    return { ok: true }
  }

  const signup = (data: SignupData) => {
    if (accounts.find(a => a.username.toLowerCase() === data.username.toLowerCase())) {
      return { ok: false, error: 'Username already taken.' }
    }
    if (accounts.find(a => a.email.toLowerCase() === data.email.toLowerCase())) {
      return { ok: false, error: 'An account with this email already exists.' }
    }
    const now = new Date()
    const profile: UserProfile = {
      username: data.username,
      email: data.email,
      phone: data.phone,
      dob: data.dob,
      address: data.address,
      role: data.role,
      memberSince: now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      tasteProfile: EMPTY_TASTE_PROFILE,
    }
    setAccounts(prev => [...prev, { ...data, profile }])
    setUser(profile)
    return { ok: true }
  }

  const logout = () => setUser(null)

  return <AuthContext.Provider value={{ user, login, signup, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
