import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ThankYou() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const orderNum = `ORD-${Math.floor(2848 + Math.random() * 100)}`

  return (
    <div
      className="min-h-full flex items-center justify-center px-6 py-16"
      style={{ background: 'var(--background)' }}
    >
      <div className="max-w-md w-full text-center">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 shadow-lg"
          style={{ background: 'var(--primary)' }}
        >
          🎉
        </div>

        <h1 className="text-4xl font-bold mb-3" style={{ fontFamily: 'Fraunces, serif' }}>
          Thank You For Your Purchase!
        </h1>

        <p className="text-lg mb-2" style={{ color: 'var(--muted-foreground)' }}>
          Your order has been placed successfully.
        </p>

        <div
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold my-4"
          style={{ background: 'var(--muted)', color: 'var(--foreground)' }}
        >
          <span style={{ color: 'var(--muted-foreground)' }}>Order #</span>
          <span>{orderNum}</span>
        </div>

        <div
          className="rounded-2xl border p-5 text-left mb-8"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <h3 className="font-bold mb-3" style={{ fontFamily: 'Fraunces, serif' }}>What happens next?</h3>
          <ol className="space-y-2 text-sm" style={{ color: 'var(--foreground)' }}>
            <li className="flex gap-3">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5"
                style={{ background: 'var(--primary)' }}
              >1</span>
              <span>Confirmation email sent to <strong>{user?.email}</strong></span>
            </li>
            <li className="flex gap-3">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5"
                style={{ background: 'var(--primary)' }}
              >2</span>
              <span>Our bakers start preparing your fresh items in the morning</span>
            </li>
            <li className="flex gap-3">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5"
                style={{ background: 'var(--primary)' }}
              >3</span>
              <span>Your order will be ready for pickup or delivery as scheduled</span>
            </li>
          </ol>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate('/')}
            className="px-8 py-4 rounded-2xl font-bold text-lg text-white transition hover:opacity-90 shadow-md"
            style={{ background: 'var(--primary)' }}
          >
            Return to Home
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="px-8 py-4 rounded-2xl font-bold text-base border-2 transition hover:bg-[var(--muted)]"
            style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
          >
            View Order History
          </button>
        </div>
      </div>
    </div>
  )
}
