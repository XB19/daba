import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ArrowRight, Clock, Inbox, Mail, Package, ShoppingBag, Users, Wallet } from 'lucide-react'
import { api, formatDate, formatPrice, ORDER_STATUS } from '../lib/api'
import { StatusBadge } from '../pages/Account'
import { Loading, PageTitle } from './kit'

function Kpi({ icon: Icon, label, value, sub, tone = 'brand' }) {
  const tones = {
    brand: 'bg-brand-50 text-brand-600',
    amber: 'bg-amber-50 text-amber-600',
    sky: 'bg-sky-50 text-sky-600',
    rose: 'bg-rose-50 text-rose-600',
  }
  return (
    <div className="a-card flex items-start gap-4 transition hover:-translate-y-0.5 hover:shadow-md">
      <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${tones[tone]}`}><Icon size={22} /></span>
      <div className="min-w-0">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="mt-0.5 truncate text-2xl font-extrabold tracking-tight">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  )
}

const ChartTip = ({ active, payload, label }) =>
  active && payload?.length ? (
    <div className="rounded-xl border border-gray-100 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-gray-500">{label}</p>
      <p className="mt-0.5 font-bold text-ink">{formatPrice(payload[0].value)}</p>
      {payload[0].payload.orders != null && <p className="text-gray-500">{payload[0].payload.orders} commande(s)</p>}
    </div>
  ) : null

export default function Dashboard() {
  const [s, setS] = useState(null)

  useEffect(() => {
    api.get('/admin/stats').then((r) => setS(r.data))
  }, [])

  if (!s) return <Loading />

  const daily = s.daily.map((d) => ({ ...d, day: new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) }))
  const statusData = Object.entries(s.byStatus).map(([k, v]) => ({ name: ORDER_STATUS[k].label, value: v, color: ORDER_STATUS[k].color }))
  const totalStatus = statusData.reduce((a, b) => a + b.value, 0)

  return (
    <>
      <PageTitle title="Tableau de bord" text="Vue d’ensemble de l’activité DABA." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={Wallet} label="Chiffre d’affaires" value={formatPrice(s.revenue)} sub={`Panier moyen : ${formatPrice(s.averageBasket)}`} />
        <Kpi icon={ShoppingBag} label="Commandes" value={s.orders} sub={`${s.pendingOrders} en attente`} tone="amber" />
        <Kpi icon={Package} label="Produits" value={s.products} sub={`${s.outOfStock} en rupture`} tone="sky" />
        <Kpi icon={Users} label="Clients inscrits" value={s.customers} sub={`${s.subscribers} abonnés newsletter`} tone="rose" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="a-card xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-bold">Ventes des 14 derniers jours</h2>
              <p className="text-xs text-gray-400">Hors commandes annulées</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={daily} margin={{ left: -10, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#42b649" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#42b649" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef1ee" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)} />
                <Tooltip content={<ChartTip />} />
                <Area type="monotone" dataKey="revenue" stroke="#33983a" strokeWidth={2.5} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="a-card">
          <h2 className="font-bold">Commandes par statut</h2>
          <p className="mb-5 text-xs text-gray-400">{totalStatus} commande(s) au total</p>
          <ul className="space-y-4">
            {statusData.map((d) => (
              <li key={d.name}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />{d.name}</span>
                  <span className="font-semibold">{d.value}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${totalStatus ? (d.value / totalStatus) * 100 : 0}%`, background: d.color }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="a-card overflow-hidden !p-0 xl:col-span-2">
          <div className="flex items-center justify-between px-5 py-4">
            <h2 className="font-bold">Dernières commandes</h2>
            <Link to="/admin/orders" className="flex items-center gap-1 text-sm font-semibold text-brand-600">Tout voir <ArrowRight size={14} /></Link>
          </div>
          {s.recentOrders.length ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/80"><tr><th className="a-th">Référence</th><th className="a-th">Client</th><th className="a-th">Date</th><th className="a-th">Statut</th><th className="a-th text-right">Total</th></tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {s.recentOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50/60">
                      <td className="a-td font-mono text-xs font-semibold">{o.reference}</td>
                      <td className="a-td">{o.customerName}</td>
                      <td className="a-td text-gray-500">{formatDate(o.createdAt)}</td>
                      <td className="a-td"><StatusBadge status={o.status} /></td>
                      <td className="a-td text-right font-bold">{formatPrice(o.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="px-5 pb-8 text-sm text-gray-400">Aucune commande pour l’instant.</p>
          )}
        </div>

        <div className="space-y-6">
          <div className="a-card">
            <h2 className="mb-4 font-bold">Top produits</h2>
            {s.topProducts.length ? (
              <div className="h-56">
                <ResponsiveContainer>
                  <BarChart data={s.topProducts} layout="vertical" margin={{ left: 0, right: 10 }}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" width={110} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#4b5563' }} />
                    <Tooltip content={<ChartTip />} cursor={{ fill: '#f3f6f3' }} />
                    <Bar dataKey="revenue" radius={[0, 6, 6, 0]} barSize={16}>
                      {s.topProducts.map((_, i) => <Cell key={i} fill={i === 0 ? '#33983a' : '#82d38c'} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Les ventes apparaîtront ici.</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/admin/messages" className="a-card transition hover:shadow-md">
              <Inbox className="text-brand-600" size={20} />
              <p className="mt-3 text-2xl font-extrabold">{s.unreadMessages}</p>
              <p className="text-xs text-gray-500">messages non lus</p>
            </Link>
            <Link to="/admin/orders" className="a-card transition hover:shadow-md">
              <Clock className="text-amber-500" size={20} />
              <p className="mt-3 text-2xl font-extrabold">{s.pendingOrders}</p>
              <p className="text-xs text-gray-500">à traiter</p>
            </Link>
          </div>
          <Link to="/admin/subscribers" className="a-card flex items-center gap-3 transition hover:shadow-md">
            <Mail size={18} className="text-rose-500" />
            <span className="text-sm"><b>{s.subscribers}</b> abonnés à la newsletter</span>
          </Link>
        </div>
      </div>
    </>
  )
}
