import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ingredientProducts } from '../data/IngredientProducts'
import { storeInfo } from '../data/storeInfo'
import { fetchSalesAnalytics, type SalesAnalytics } from '../lib/analyticsApi'

type PurchaseOrder = {
  id: string
  date: string
  items: string[]
  total: number
}

type InventoryRecord = {
  inventoryTransactionId?: string
  transactionDate?: string
  totalCost?: number
  lineItems?: Array<{ ingredientName?: string; quantity?: number; unitOfMeasure?: string }>
}

const cardStyle = { background: 'var(--card)', borderColor: 'var(--border)' }
const mutedText = { color: 'var(--muted-foreground)' }
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const formatMoney = (value: number) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const formatChange = (change: number | null) => (change === null ? '' : `${change >= 0 ? '+' : ''}${change}%`)
const formatDate = (value?: string) => {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
const formatIsoDay = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return `${MONTHS_SHORT[m - 1]} ${d}, ${y}`
}
const formatDob = (dob: string) => (dob ? formatDate(`${dob}T00:00:00`) : '—')
// Purchase orders store ingredient names like "all_purpose_flour".
const prettyIngredient = (name?: string) =>
  (name || 'Ingredient').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

// Same thresholds as the Inventory page.
const stockStatus = (item: (typeof ingredientProducts)[number]) => {
  const ratio = item.currentStock / item.parLevel
  return ratio <= 0.3 ? 'Critical' : ratio < 1 ? 'Low' : 'Good'
}

const normalizePurchaseOrder = (tx: InventoryRecord): PurchaseOrder => ({
  id: tx.inventoryTransactionId || 'Purchase order',
  date: formatDate(tx.transactionDate),
  items: (tx.lineItems || []).map(line => `${prettyIngredient(line.ingredientName)} ×${line.quantity ?? 0} ${line.unitOfMeasure ?? ''}`.trim()),
  total: Number(tx.totalCost || 0),
})

const inventoryAlerts = ingredientProducts
  .map(item => ({ ...item, status: stockStatus(item) }))
  .filter(item => item.status !== 'Good')
  .sort((a, b) => a.currentStock / a.parLevel - b.currentStock / b.parLevel)

const suppliers = (() => {
  const bySupplier = new Map<string, { name: string; ingredients: string[]; belowPar: number; lastDelivery: number }>()
  for (const item of ingredientProducts) {
    const entry = bySupplier.get(item.supplier) ?? { name: item.supplier, ingredients: [], belowPar: 0, lastDelivery: 0 }
    entry.ingredients.push(item.name)
    if (stockStatus(item) !== 'Good') entry.belowPar += 1
    entry.lastDelivery = Math.max(entry.lastDelivery, new Date(item.lastRestocked).getTime() || 0)
    bySupplier.set(item.supplier, entry)
  }
  return [...bySupplier.values()].sort((a, b) => b.ingredients.length - a.ingredients.length)
})()

function Card({ title, icon, action, children, className = '' }: { title: string; icon?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border p-6 ${className}`} style={cardStyle}>
      <div className="flex items-center justify-between gap-3 mb-5">
        <h2 className="text-xl font-bold flex items-center gap-2" style={{ fontFamily: 'Fraunces, serif' }}>
          {icon && <span aria-hidden="true">{icon}</span>}
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  )
}

function LinkButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button className="text-sm font-semibold whitespace-nowrap" style={{ color: 'var(--primary)' }} onClick={onClick}>
      {label} →
    </button>
  )
}

function DetailRows({ rows }: { rows: [string, string][] }) {
  return (
    <div className="space-y-1 text-sm">
      {rows.map(([label, value]) => (
        <div key={label} className="flex justify-between gap-4 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
          <span style={mutedText}>{label}</span>
          <span className="font-semibold text-right min-w-0 max-w-[65%] truncate" title={value}>{value}</span>
        </div>
      ))}
    </div>
  )
}

export default function AdminProfile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [ordersState, setOrdersState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [analytics, setAnalytics] = useState<SalesAnalytics | null>(null)
  const [analyticsError, setAnalyticsError] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    fetch('http://localhost:5050/inventory?limit=5', { signal: controller.signal })
      .then(async response => {
        const result = await response.json()
        if (!response.ok) throw new Error(result.error)
        setPurchaseOrders((result as InventoryRecord[]).map(normalizePurchaseOrder))
        setOrdersState('ready')
      })
      .catch(error => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setOrdersState('error')
      })

    fetchSalesAnalytics(undefined, controller.signal)
      .then(setAnalytics)
      .catch(error => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setAnalyticsError(true)
      })
    return () => controller.abort()
  }, [])

  const name = user?.username ?? 'Admin'
  const kpis = analytics?.kpis

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-4xl font-bold" style={{ fontFamily: 'Fraunces, serif' }}>My Profile</h1>
          <p className="mt-1 text-sm" style={mutedText}>
            Franchise administrator · {storeInfo.brand} {storeInfo.locationName}
          </p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition hover:bg-red-50"
          style={{ borderColor: '#E74C3C44', color: '#C0392B' }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Account Information">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white" style={{ background: 'var(--primary)' }}>
              {name[0]?.toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-lg">{name}</div>
              <div className="text-sm" style={mutedText}>{user?.email || '—'}</div>
              <div className="inline-flex items-center gap-1 mt-1 text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: '#E8F5FF', color: 'var(--primary)' }}>
                🏭 Administrator
              </div>
            </div>
          </div>
          <DetailRows rows={[
            ['Username', user?.username || '—'],
            ['Email', user?.email || '—'],
            ['Phone', user?.phone || '—'],
            ['Date of Birth', formatDob(user?.dob ?? '')],
            ['Address', user?.address || '—'],
            ['Member Since', user?.memberSince || '—'],
          ]} />
        </Card>

        <Card title="Franchise Details" icon="🏪">
          <DetailRows rows={[
            ['Store', `${storeInfo.brand} ${storeInfo.locationName}`],
            ['Store ID', storeInfo.storeId],
            ['Location', `${storeInfo.city}, ${storeInfo.state}`],
            ['HQ Ordering Code', storeInfo.inventoryLocationId],
            ['Access Level', 'Franchise Administrator'],
          ]} />
          <div className="mt-5">
            <div className="text-sm font-semibold mb-2" style={mutedText}>STORE HOURS</div>
            <div className="space-y-1.5 text-sm">
              {storeInfo.hours.map(h => (
                <div key={h.days} className="flex justify-between">
                  <span>{h.days}</span>
                  <span className="font-semibold">{h.time}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card title="Business Snapshot" icon="📊" action={<LinkButton label="Analytics" onClick={() => navigate('/analytics')} />}>
          {!analytics ? (
            <p className="text-sm" style={mutedText}>{analyticsError ? 'Sales data is unavailable right now.' : 'Loading sales data…'}</p>
          ) : (
            <>
              <p className="text-sm mb-4" style={mutedText}>
                {analytics.selected.label}
                {analytics.selected.partial && analytics.selected.throughDate && `, month to date through ${formatIsoDay(analytics.selected.throughDate)}`}
                {analytics.selected.comparisonLabel && ` · changes ${analytics.selected.comparisonLabel}`}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Revenue', value: formatMoney(kpis!.revenue.value), change: kpis!.revenue.change },
                  { label: 'Orders', value: kpis!.orders.value.toLocaleString('en-US'), change: kpis!.orders.change },
                  { label: 'Active Subscribers', value: kpis!.subscribers.value.toLocaleString('en-US'), change: kpis!.subscribers.change },
                  { label: 'Top Product', value: kpis!.popularProduct?.name ?? '—', change: null, note: kpis!.popularProduct ? `${kpis!.popularProduct.units} sold` : '' },
                ].map(stat => (
                  <div key={stat.label} className="rounded-xl p-3" style={{ background: 'var(--muted)' }}>
                    <div className="text-xs" style={mutedText}>{stat.label}</div>
                    <div className="font-bold text-base leading-tight mt-0.5">{stat.value}</div>
                    <div className={`text-xs font-semibold mt-0.5 ${stat.change === null ? '' : stat.change >= 0 ? 'text-green-700' : 'text-red-600'}`} style={stat.change === null ? mutedText : undefined}>
                      {stat.change === null ? stat.note : formatChange(stat.change)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>

        <Card title="Inventory Alerts" icon="⚠️" action={<LinkButton label="Inventory" onClick={() => navigate('/inventory')} />}>
          {inventoryAlerts.length === 0 ? (
            <p className="text-sm" style={mutedText}>All ingredients are at or above par level.</p>
          ) : (
            <>
              <p className="text-sm mb-3" style={mutedText}>
                {inventoryAlerts.length} ingredient{inventoryAlerts.length === 1 ? ' is' : 's are'} below par level.
              </p>
              <div className="space-y-2">
                {inventoryAlerts.slice(0, 5).map(item => (
                  <div key={item.id} className="flex items-center justify-between gap-3 text-sm py-1.5 border-b" style={{ borderColor: 'var(--border)' }}>
                    <span className="font-semibold">{item.name}</span>
                    <span className="flex items-center gap-2 whitespace-nowrap">
                      <span style={mutedText}>{item.currentStock}/{item.parLevel} {item.unit}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${item.status === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {item.status}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
              {inventoryAlerts.length > 5 && (
                <p className="text-xs mt-2" style={mutedText}>+{inventoryAlerts.length - 5} more on the Inventory page</p>
              )}
            </>
          )}
        </Card>
      </div>

      <Card title="Supplier Directory" icon="🚚">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Supplier', 'Supplies', 'Below Par', 'Last Delivery'].map(h => (
                  <th key={h} className="text-left py-2 px-3 font-semibold whitespace-nowrap" style={mutedText}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {suppliers.map(s => (
                <tr key={s.name} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="py-3 px-3 font-semibold whitespace-nowrap">{s.name}</td>
                  <td className="py-3 px-3">
                    {s.ingredients.slice(0, 3).join(', ')}
                    {s.ingredients.length > 3 && <span style={mutedText}> +{s.ingredients.length - 3} more</span>}
                  </td>
                  <td className="py-3 px-3">
                    {s.belowPar > 0
                      ? <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">{s.belowPar}</span>
                      : <span style={mutedText}>—</span>}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">{s.lastDelivery ? formatDate(new Date(s.lastDelivery).toISOString()) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Recent Bulk Orders" icon="📋" action={<LinkButton label="New bulk order" onClick={() => navigate('/')} />}>
        {ordersState === 'loading' && <p className="text-sm" style={mutedText}>Loading recent orders…</p>}
        {ordersState === 'error' && <p className="text-sm text-red-600">Unable to load order history.</p>}
        {ordersState === 'ready' && purchaseOrders.length === 0 && <p className="text-sm" style={mutedText}>No bulk orders yet.</p>}
        {ordersState === 'ready' && purchaseOrders.length > 0 && (
          <div className="space-y-4">
            {purchaseOrders.map(order => (
              <div key={order.id} className="flex items-start justify-between gap-4 p-4 rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--muted)' }}>
                <div className="min-w-0">
                  <div className="font-bold text-sm">{order.id}</div>
                  <div className="text-xs mt-0.5" style={mutedText}>{order.date} · {order.items.length} line item{order.items.length === 1 ? '' : 's'}</div>
                  <div className="text-sm mt-1">{order.items.join(' · ')}</div>
                </div>
                <div className="font-bold whitespace-nowrap">{formatMoney(order.total)}</div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
