import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Banknote, CreditCard, House, Lock, Smartphone, Store } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useSite } from '../context/SiteContext'
import { Spinner } from '../components/ui'
import { api, errorMessage, formatPrice } from '../lib/api'

function Choice({ checked, onClick, icon: Icon, title, text }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition ${
        checked ? 'border-brand-500 bg-brand-50/60' : 'border-gray-100 hover:border-gray-200'
      }`}
    >
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${checked ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
        <Icon size={20} />
      </span>
      <span className="flex-1">
        <span className="block font-bold">{title}</span>
        {text && <span className="block text-xs text-gray-500">{text}</span>}
      </span>
      <span className={`h-5 w-5 rounded-full border-2 ${checked ? 'border-brand-500 bg-brand-500 ring-4 ring-inset ring-white' : 'border-gray-300'}`} />
    </button>
  )
}

export default function Checkout() {
  const { items, subtotal, clear } = useCart()
  const { user } = useAuth()
  const { t } = useSite()
  const navigate = useNavigate()
  const [sending, setSending] = useState(false)
  const [form, setForm] = useState({ customerName: '', phone: '', email: '', address: '', note: '', deliveryMode: 'delivery', paymentMethod: 'cash' })

  useEffect(() => {
    if (user) setForm((f) => ({ ...f, customerName: f.customerName || user.fullName, email: f.email || user.email, phone: f.phone || user.phone || '' }))
  }, [user])

  if (!items.length) return <Navigate to="/cart" replace />

  const fee = form.deliveryMode === 'delivery' ? Number(t('delivery.fee', '1000')) : 0
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setSending(true)
    try {
      const { data } = await api.post('/public/orders', {
        ...form,
        items: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
      })
      clear()
      navigate(`/order/${data.reference}`, { state: { order: data }, replace: true })
    } catch (err) {
      toast.error(errorMessage(err, 'La commande n’a pas pu être enregistrée'))
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="bg-gray-50/70 pt-32 pb-20 lg:pt-36">
      <form onSubmit={submit} className="container-x grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div>
            <h1 className="text-3xl font-extrabold md:text-4xl">Finaliser ma commande</h1>
            {!user && (
              <p className="mt-2 text-sm text-gray-500">
                Déjà client ? <Link to="/login?next=/checkout" className="font-semibold text-brand-600">Connectez-vous</Link> pour suivre vos commandes.
              </p>
            )}
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
            <h2 className="mb-6 flex items-center gap-3 text-lg font-bold"><span className="grid h-8 w-8 place-items-center rounded-full bg-brand-500 text-sm text-white">1</span> Vos coordonnées</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <div><label className="label">Nom complet *</label><input required value={form.customerName} onChange={set('customerName')} className="input" placeholder="Votre nom" /></div>
              <div><label className="label">Téléphone *</label><input required value={form.phone} onChange={set('phone')} className="input" placeholder="+228 XX XX XX XX" /></div>
              <div className="sm:col-span-2"><label className="label">Email</label><input type="email" value={form.email} onChange={set('email')} className="input" placeholder="votre@email.com" /></div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
            <h2 className="mb-6 flex items-center gap-3 text-lg font-bold"><span className="grid h-8 w-8 place-items-center rounded-full bg-brand-500 text-sm text-white">2</span> Mode de réception</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Choice checked={form.deliveryMode === 'delivery'} onClick={() => setForm({ ...form, deliveryMode: 'delivery' })} icon={House} title="Livraison à domicile" text={`Sous 24h – ${formatPrice(t('delivery.fee', '1000'))}`} />
              <Choice checked={form.deliveryMode === 'pickup'} onClick={() => setForm({ ...form, deliveryMode: 'pickup' })} icon={Store} title="Retrait en agence" text="Gratuit – à notre agence" />
            </div>
            {form.deliveryMode === 'delivery' && (
              <div className="mt-5"><label className="label">Adresse de livraison *</label><input required value={form.address} onChange={set('address')} className="input" placeholder="Quartier, rue, repère, maison..." /></div>
            )}
            <div className="mt-5"><label className="label">Note pour la commande</label><textarea rows={3} value={form.note} onChange={set('note')} className="input resize-none" placeholder="Instructions particulières (facultatif)" /></div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
            <h2 className="mb-6 flex items-center gap-3 text-lg font-bold"><span className="grid h-8 w-8 place-items-center rounded-full bg-brand-500 text-sm text-white">3</span> Paiement</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Choice checked={form.paymentMethod === 'cash'} onClick={() => setForm({ ...form, paymentMethod: 'cash' })} icon={Banknote} title="Paiement à la livraison" text="Espèces à réception" />
              <Choice checked={form.paymentMethod === 'tmoney'} onClick={() => setForm({ ...form, paymentMethod: 'tmoney' })} icon={Smartphone} title="TMoney" text="Mobile money" />
              <Choice checked={form.paymentMethod === 'flooz'} onClick={() => setForm({ ...form, paymentMethod: 'flooz' })} icon={Smartphone} title="Flooz" text="Mobile money" />
              <Choice checked={form.paymentMethod === 'card'} onClick={() => setForm({ ...form, paymentMethod: 'card' })} icon={CreditCard} title="Carte bancaire" text="Visa, Mastercard" />
            </div>
          </div>
        </div>

        <aside className="h-fit rounded-3xl bg-white p-6 shadow-sm lg:sticky lg:top-28">
          <h2 className="text-xl font-bold">Ma commande</h2>
          <ul className="mt-5 max-h-72 space-y-4 overflow-y-auto pr-1">
            {items.map((i) => (
              <li key={i.id} className="flex items-center gap-3">
                <span className="relative">
                  <img src={i.imageUrl || undefined} alt="" className="h-14 w-14 rounded-xl object-cover" />
                  <span className="absolute -top-2 -right-2 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[10px] font-bold text-white">{i.quantity}</span>
                </span>
                <span className="flex-1 text-sm font-semibold">{i.name}</span>
                <span className="text-sm font-bold">{formatPrice(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-6 space-y-3 border-t border-gray-100 pt-5 text-sm">
            <div className="flex justify-between"><dt className="text-gray-500">Sous-total</dt><dd className="font-semibold">{formatPrice(subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Livraison</dt><dd className="font-semibold">{fee ? formatPrice(fee) : 'Gratuit'}</dd></div>
            <div className="flex justify-between border-t border-dashed border-gray-200 pt-4 text-base">
              <dt className="font-bold">Total à payer</dt><dd className="text-xl font-extrabold text-brand-600">{formatPrice(subtotal + fee)}</dd>
            </div>
          </dl>
          <button disabled={sending} className="btn-primary mt-6 w-full !py-4">
            {sending ? <Spinner className="h-5 w-5" /> : <Lock size={16} />} Confirmer la commande
          </button>
          <p className="mt-4 text-center text-xs text-gray-400">En confirmant, vous acceptez nos conditions générales de vente.</p>
        </aside>
      </form>
    </section>
  )
}
