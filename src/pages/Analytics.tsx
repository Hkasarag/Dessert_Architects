import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LineChart, Line, BarChart, Bar, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { fetchSalesAnalytics, type InventoryRow, type SalesAnalytics } from '../lib/analyticsApi'

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const INVENTORY_PREVIEW_ROWS = 8

const formatMoney = (value: number) => `$${Math.round(value).toLocaleString('en-US')}`
const formatDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return `${MONTHS_SHORT[m - 1]} ${d}, ${y}`
}
const formatChange = (change: number | null) => (change === null ? '—' : `${change >= 0 ? '+' : ''}${change}%`)

// Axis ticks show just the month ("Oct"); tooltips show the full "Oct 25" label.
const monthTick = (label: string) => label.slice(0, 3)
const monthAxisProps = { dataKey: 'label', interval: 0, tickFormatter: monthTick, tick: { fontSize: 11, fill: 'var(--muted-foreground)' } } as const

const tooltipStyle = { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px' }
const cardStyle = { background: 'var(--card)', borderColor: 'var(--border)' }

type Tone = 'up' | 'down' | 'neutral' | 'warn'

type Kpi = {
  label: string
  value: string
  badge: string
  tone: Tone
  icon: string
}

const badgeClass: Record<Tone, string> = {
  up: 'text-green-700 bg-green-100',
  down: 'text-red-700 bg-red-100',
  warn: 'text-amber-700 bg-amber-100',
  neutral: 'text-sky-700 bg-sky-100',
}

const changeTone = (change: number | null): Tone => (change === null ? 'neutral' : change >= 0 ? 'up' : 'down')

function KpiCard({ kpi }: { kpi: Kpi }) {
  return (
    <div className="rounded-2xl border p-5 flex flex-col gap-2" style={cardStyle}>
      <div className="flex items-center justify-between">
        <span className="text-2xl">{kpi.icon}</span>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${badgeClass[kpi.tone]}`}>{kpi.badge}</span>
      </div>
      <div className="font-bold text-xl mt-1 leading-tight">{kpi.value}</div>
      <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{kpi.label}</div>
    </div>
  )
}

function buildKpis(data: SalesAnalytics): Kpi[] {
  const { kpis } = data
  return [
    { label: 'Monthly Revenue', value: formatMoney(kpis.revenue.value), badge: formatChange(kpis.revenue.change), tone: changeTone(kpis.revenue.change), icon: '💰' },
    { label: 'Monthly Orders', value: kpis.orders.value.toLocaleString('en-US'), badge: formatChange(kpis.orders.change), tone: changeTone(kpis.orders.change), icon: '📋' },
    { label: 'New Customers', value: kpis.newCustomers.value.toLocaleString('en-US'), badge: formatChange(kpis.newCustomers.change), tone: changeTone(kpis.newCustomers.change), icon: '👥' },
    {
      label: 'Popular Product',
      value: kpis.popularProduct?.name ?? '—',
      badge: kpis.popularProduct ? `${kpis.popularProduct.units.toLocaleString('en-US')} sold` : '—',
      tone: 'neutral',
      icon: '🍪',
    },
    { label: 'Subscriptions', value: `${kpis.subscribers.value} active`, badge: formatChange(kpis.subscribers.change), tone: changeTone(kpis.subscribers.change), icon: '📦' },
    {
      label: 'Inventory Health',
      value: kpis.inventory.health,
      badge: `${kpis.inventory.alerts} alert${kpis.inventory.alerts === 1 ? '' : 's'}`,
      tone: kpis.inventory.alerts > 0 ? 'warn' : 'up',
      icon: '🏭',
    },
  ]
}

function MonthPicker({ data, value, onChange }: { data: SalesAnalytics; value: string; onChange: (key: string) => void }) {
  const years = new Map<string, { key: string; label: string }[]>()
  for (const month of data.months) {
    const year = month.key.slice(0, 4)
    years.set(year, [...(years.get(year) ?? []), month])
  }

  return (
    <label className="flex items-center gap-2 text-sm font-semibold">
      <span style={{ color: 'var(--muted-foreground)' }}>Month</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="px-3 py-2 rounded-xl border text-sm font-semibold outline-none cursor-pointer"
        style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
      >
        {[...years.entries()].map(([year, months]) => (
          <optgroup key={year} label={year}>
            {months.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
          </optgroup>
        ))}
      </select>
    </label>
  )
}

function RunoutCell({ row }: { row: InventoryRow }) {
  if (row.daysOfCover === null || row.runoutDate === null) {
    return <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{row.usageNote}</span>
  }
  return (
    <span>
      {formatDate(row.runoutDate)}
      <span className="text-xs ml-1.5" style={{ color: 'var(--muted-foreground)' }}>({row.daysOfCover} days)</span>
    </span>
  )
}

export default function Analytics() {
  const navigate = useNavigate()
  const [month, setMonth] = useState<string | undefined>(undefined)
  const [data, setData] = useState<SalesAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAllInventory, setShowAllInventory] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')
    fetchSalesAnalytics(month, controller.signal)
      .then(result => setData(result))
      .catch(err => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setError(err instanceof Error ? err.message : 'Unable to load sales analytics.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [month])

  if (!data) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold" style={{ fontFamily: 'Fraunces, serif' }}>Business Analytics</h1>
        <p className={`mt-4 text-sm ${error ? 'text-red-600' : ''}`} style={error ? undefined : { color: 'var(--muted-foreground)' }}>
          {error || 'Loading sales analytics…'}
        </p>
      </div>
    )
  }

  const { selected } = data
  const kpis = buildKpis(data)
  const subscriptionTotal = data.subscriptionMix.plans.reduce((sum, p) => sum + p.customers, 0)
  const inventoryRows = showAllInventory ? data.inventory.rows : data.inventory.rows.slice(0, INVENTORY_PREVIEW_ROWS)

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-4xl font-bold" style={{ fontFamily: 'Fraunces, serif' }}>Business Analytics</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>
            {selected.label}
            {selected.partial && selected.throughDate && ` · Month to date through ${formatDate(selected.throughDate)}`}
            {' · Admin view'}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <MonthPicker data={data} value={selected.key} onChange={key => setMonth(key)} />
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold" style={{ background: '#E8F5FF', color: 'var(--primary)' }}>
            🔒 Admin Only
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="space-y-8 transition-opacity" style={{ opacity: loading ? 0.5 : 1 }} aria-busy={loading}>
        {/* KPIs */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {kpis.map(kpi => <KpiCard key={kpi.label} kpi={kpi} />)}
          </div>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            {selected.comparisonLabel ? `Changes compare with ${selected.comparisonLabel.replace(/^vs /, '')}.` : 'No earlier month to compare with.'}
            {' '}Subscriptions count members who ordered this month.
            {selected.firstYearOfData && ' Sales history starts in January 2019, so 2019 new-customer counts include existing customers making their first recorded purchase.'}
          </p>
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border p-6" style={cardStyle}>
            <h3 className="font-bold text-lg" style={{ fontFamily: 'Fraunces, serif' }}>Monthly Sales Trend</h3>
            <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>Revenue for the 12 months ending {selected.label}</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.salesTrend} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis {...monthAxisProps} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} tickFormatter={v => `$${(Number(v) / 1000).toFixed(1)}k`} width={52} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v, name) => (name === 'revenue' ? [formatMoney(Number(v)), 'Revenue'] : [Number(v).toLocaleString('en-US'), 'Orders'])}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6BBFD8"
                  strokeWidth={3}
                  dot={props => {
                    const isSelected = props.payload?.key === selected.key
                    return (
                      <circle
                        key={props.payload?.key}
                        cx={props.cx}
                        cy={props.cy}
                        r={isSelected ? 7 : 4}
                        fill={isSelected ? '#F4A361' : '#6BBFD8'}
                        stroke="white"
                        strokeWidth={isSelected ? 2 : 0}
                      />
                    )
                  }}
                />
                <Line type="monotone" dataKey="orders" stroke="transparent" dot={false} activeDot={false} legendType="none" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-2xl border p-6" style={cardStyle}>
            <h3 className="font-bold text-lg" style={{ fontFamily: 'Fraunces, serif' }}>Customer Growth</h3>
            <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>New and returning customers who ordered each month</p>
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={data.customerGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis {...monthAxisProps} />
                <YAxis yAxisId="returning" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} width={40} />
                <YAxis yAxisId="new" orientation="right" allowDecimals={false} tick={{ fontSize: 12, fill: '#E08A3C' }} width={32} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v, name) => [v, name === 'new' ? 'New Customers' : 'Returning']} />
                <Bar yAxisId="returning" dataKey="returning" fill="#6BBFD8" radius={[6, 6, 0, 0]} />
                <Line yAxisId="new" type="monotone" dataKey="new" stroke="#F4A361" strokeWidth={3} dot={{ fill: '#F4A361', r: 4 }} />
                <Legend formatter={v => (v === 'new' ? 'New Customers (right axis)' : 'Returning')} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border p-6" style={cardStyle}>
            <h3 className="font-bold text-lg" style={{ fontFamily: 'Fraunces, serif' }}>Product Popularity</h3>
            <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>Top sellers by units sold in {selected.label}</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.productPopularity} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                <YAxis type="category" dataKey="name" width={170} tick={{ fontSize: 11, fill: 'var(--foreground)' }} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v, _name, item) => [`${v} sold · ${formatMoney(item.payload.revenue)}`, 'Units']}
                />
                <Bar dataKey="units" fill="#6BBFD8" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-2xl border p-6" style={cardStyle}>
            <h3 className="font-bold text-lg" style={{ fontFamily: 'Fraunces, serif' }}>Subscription Mix</h3>
            <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>
              {data.subscriptionMix.subscribers} of {data.subscriptionMix.totalCustomers} customers who ordered were members
              {data.subscriptionMix.totalCustomers > 0 && ` (${Math.round((data.subscriptionMix.subscribers / data.subscriptionMix.totalCustomers) * 100)}%)`}
            </p>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={data.subscriptionMix.plans} cx="50%" cy="50%" innerRadius={60} outerRadius={92} paddingAngle={3} dataKey="customers" nameKey="name">
                  {data.subscriptionMix.plans.map(plan => <Cell key={plan.name} fill={plan.color} />)}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={v => [`${v} members · ${subscriptionTotal > 0 ? Math.round((Number(v) / subscriptionTotal) * 100) : 0}%`, 'Share']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insights */}
        <div className="rounded-2xl border p-6" style={cardStyle}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: 'var(--primary)' }}>✨</div>
            <div>
              <h3 className="font-bold text-lg" style={{ fontFamily: 'Fraunces, serif' }}>AI Business Insights</h3>
              <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Generated from {selected.label} sales data</div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.insights.map(ins => (
              <div
                key={ins.text}
                className="rounded-xl p-4 flex gap-3 items-start"
                style={{
                  background: ins.type === 'warning' ? '#FFF8E0' : ins.type === 'forecast' ? '#F0E8FF' : '#F0FFF4',
                  borderLeft: `3px solid ${ins.type === 'warning' ? '#F4A361' : ins.type === 'forecast' ? '#9C27B0' : '#4CAF50'}`,
                }}
              >
                <span className="text-xl flex-shrink-0 mt-0.5">{ins.icon}</span>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>{ins.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory */}
        <div className="rounded-2xl border p-6" style={cardStyle}>
          <h3 className="font-bold text-lg" style={{ fontFamily: 'Fraunces, serif' }}>Inventory Health & Restock Estimates</h3>
          <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>
            Current stock as of {formatDate(data.inventory.asOf)}. Runout dates use the last {data.inventory.usageWindowDays} days of sales and estimated recipe amounts per item.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Ingredient', 'Current Stock', 'Daily Use (est.)', 'Estimated Runout', 'Status', 'Action'].map(h => (
                    <th key={h} className="text-left py-2 px-3 font-semibold whitespace-nowrap" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {inventoryRows.map(row => (
                  <tr key={row.ingredient} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="py-3 px-3 font-semibold">{row.ingredient}</td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {row.currentStock} {row.unit}
                      <span className="text-xs ml-1.5" style={{ color: 'var(--muted-foreground)' }}>par {row.parLevel}</span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">{row.dailyUsage > 0 ? `${row.dailyUsage} ${row.unit}` : '—'}</td>
                    <td className="py-3 px-3"><RunoutCell row={row} /></td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        row.status === 'Good' ? 'bg-green-100 text-green-700' :
                        row.status === 'Low' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {row.needsReorder && (
                        <button
                          className="text-xs font-bold px-3 py-1.5 rounded-lg text-white whitespace-nowrap"
                          style={{ background: 'var(--primary)' }}
                          onClick={() => navigate('/')}
                        >
                          Order Now
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.inventory.rows.length > INVENTORY_PREVIEW_ROWS && (
            <button className="mt-4 text-sm font-semibold" style={{ color: 'var(--primary)' }} onClick={() => setShowAllInventory(v => !v)}>
              {showAllInventory ? 'Show fewer ingredients' : `Show all ${data.inventory.rows.length} ingredients →`}
            </button>
          )}
        </div>

        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          Source: {data.source.fileName} · {data.source.transactions.toLocaleString('en-US')} transactions from {formatDate(data.source.firstDate)} to {formatDate(data.source.lastDate)}
        </p>
      </div>
    </div>
  )
}
