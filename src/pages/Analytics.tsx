import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { menuProducts } from '../data/menuProducts'
import { getIngredientProduct } from '../data/IngredientProducts'

const salesData = [
  { month: 'Apr', revenue: 18400, orders: 312 },
  { month: 'May', revenue: 21200, orders: 358 },
  { month: 'Jun', revenue: 19800, orders: 334 },
  { month: 'Jul', revenue: 23600, orders: 401 },
  { month: 'Aug', revenue: 26100, orders: 440 },
  { month: 'Sep', revenue: 28940, orders: 487 },
]

const customerGrowth = [
  { month: 'Apr', new: 48, returning: 264 },
  { month: 'May', new: 62, returning: 296 },
  { month: 'Jun', new: 55, returning: 279 },
  { month: 'Jul', new: 74, returning: 327 },
  { month: 'Aug', new: 89, returning: 351 },
  { month: 'Sep', new: 103, returning: 384 },
]

const popularProducts = [
  { productId: 1, sales: 1240 },
  { productId: 60, sales: 980 },
  { productId: 20, sales: 720 },
  { productId: 40, sales: 650 },
  { productId: 21, sales: 580 },
  { productId: 61, sales: 490 },
].flatMap(({ productId, sales }) => {
  const product = menuProducts.find(item => item.id === productId)
  return product ? [{ name: product.name, sales }] : []
})

const subscriptions = [
  { name: 'Sweet Starter', value: 28, color: '#6BBFD8' },
  { name: 'Dessert Box', value: 22, color: '#F4A361' },
  { name: 'Family Favorites', value: 38, color: '#4CAF50' },
  { name: 'VIP Club', value: 12, color: '#9C27B0' },
]

const insights = [
  { icon: '📈', text: 'Chocolate Chip Cookie sales are trending 18% higher than last month', type: 'positive' },
  { icon: '🍫', text: 'Chocolate Brownie demand is expected to increase 24% next weekend', type: 'positive' },
  { icon: '⚠️', text: 'Vanilla Cupcake inventory may need replenishment within 7 days', type: 'warning' },
  { icon: '🍂', text: 'Carrot Cupcake sales are outperforming last year by 32%', type: 'positive' },
  { icon: '📦', text: 'Family Favorites subscriptions grew 14% this month — highest ever', type: 'positive' },
  { icon: '🔮', text: 'Predict 20% revenue increase for October — plan staffing accordingly', type: 'forecast' },
]

const kpis = [
  { label: 'Monthly Revenue', value: '$28,940', change: '+11.6%', up: true, icon: '💰' },
  { label: 'Monthly Orders', value: '487', change: '+10.7%', up: true, icon: '📋' },
  { label: 'New Customers', value: '103', change: '+15.7%', up: true, icon: '👥' },
  { label: 'Popular Product', value: 'Chocolate Chip Cookie', change: '1,240 sold', up: true, icon: '🍪' },
  { label: 'Subscriptions', value: '214 active', change: '+14.1%', up: true, icon: '📦' },
  { label: 'Inventory Health', value: 'Good', change: '1 alert', up: false, icon: '🏭' },
]

const inventoryHealthRows = [
  { ingredientId: 2, runout: 'Oct 8' },
  { ingredientId: 24, runout: 'Sep 29' },
  { ingredientId: 14, runout: 'Oct 15' },
  { ingredientId: 5, runout: 'Oct 3' },
  { ingredientId: 6, runout: 'Sep 27' },
].flatMap(({ ingredientId, runout }) => {
  const ingredient = getIngredientProduct(ingredientId)
  if (!ingredient) return []

  const ratio = ingredient.currentStock / ingredient.parLevel
  const status = ratio <= 0.3 ? 'Critical' : ratio < 1 ? 'Low' : 'Good'
  return [{
    name: ingredient.name,
    stock: `${ingredient.currentStock} ${ingredient.unit}`,
    runout,
    status,
    color: status === 'Critical' ? 'red' : status === 'Low' ? 'amber' : 'green',
  }]
})

function KpiCard({ kpi }: { kpi: typeof kpis[0] }) {
  return (
    <div
      className="rounded-2xl border p-5 flex flex-col gap-2"
      style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-2xl">{kpi.icon}</span>
        <span
          className={`text-xs font-bold px-2 py-1 rounded-full ${kpi.up ? 'text-green-700 bg-green-100' : 'text-amber-700 bg-amber-100'}`}
        >
          {kpi.change}
        </span>
      </div>
      <div className="font-bold text-xl mt-1">{kpi.value}</div>
      <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{kpi.label}</div>
    </div>
  )
}

export default function Analytics() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold" style={{ fontFamily: 'Fraunces, serif' }}>Business Analytics</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>September 2026 · Admin view</p>
        </div>
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
          style={{ background: '#E8F5FF', color: 'var(--primary)' }}
        >
          🔒 Admin Only
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map(kpi => <KpiCard key={kpi.label} kpi={kpi} />)}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border p-6" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <h3 className="font-bold text-lg mb-4" style={{ fontFamily: 'Fraunces, serif' }}>Monthly Sales Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
              <Tooltip
                contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px' }}
                formatter={(v) => [`$${Number(v).toLocaleString()}`, 'Revenue']}
              />
              <Line type="monotone" dataKey="revenue" stroke="#6BBFD8" strokeWidth={3} dot={{ fill: '#6BBFD8', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border p-6" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <h3 className="font-bold text-lg mb-4" style={{ fontFamily: 'Fraunces, serif' }}>Customer Growth</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={customerGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px' }} />
              <Bar dataKey="returning" stackId="a" fill="#6BBFD8" radius={[0, 0, 6, 6]} />
              <Bar dataKey="new" stackId="a" fill="#F4A361" radius={[6, 6, 0, 0]} />
              <Legend formatter={(v) => v === 'new' ? 'New Customers' : 'Returning'} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border p-6" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <h3 className="font-bold text-lg mb-4" style={{ fontFamily: 'Fraunces, serif' }}>Product Popularity</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={popularProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
              <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11, fill: 'var(--foreground)' }} />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px' }} />
              <Bar dataKey="sales" fill="#6BBFD8" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border p-6" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <h3 className="font-bold text-lg mb-4" style={{ fontFamily: 'Fraunces, serif' }}>Subscription Mix</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={subscriptions} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {subscriptions.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip
                contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px' }}
                formatter={(v) => [`${v}%`, 'Share']}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Insights */}
      <div className="rounded-2xl border p-6" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ background: 'var(--primary)' }}
          >✨</div>
          <div>
            <h3 className="font-bold text-lg" style={{ fontFamily: 'Fraunces, serif' }}>AI Business Insights</h3>
            <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Updated just now · Powered by bakery AI</div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {insights.map((ins, i) => (
            <div
              key={i}
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
      <div className="rounded-2xl border p-6" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <h3 className="font-bold text-lg mb-4" style={{ fontFamily: 'Fraunces, serif' }}>Inventory Health & Restock Estimates</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Ingredient', 'Current Stock', 'Estimated Runout', 'Status', 'Action'].map(h => (
                  <th key={h} className="text-left py-2 px-3 font-semibold" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {inventoryHealthRows.map(row => (
                <tr key={row.name} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="py-3 px-3 font-semibold">{row.name}</td>
                  <td className="py-3 px-3">{row.stock}</td>
                  <td className="py-3 px-3">{row.runout}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      row.color === 'green' ? 'bg-green-100 text-green-700' :
                      row.color === 'amber' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    {row.color !== 'green' && (
                      <button
                        className="text-xs font-bold px-3 py-1.5 rounded-lg text-white"
                        style={{ background: 'var(--primary)' }}
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
      </div>
    </div>
  )
}
