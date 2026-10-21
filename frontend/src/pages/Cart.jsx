import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useSite } from '../context/SiteContext'
import { formatPrice } from '../lib/api'

export function QtyControl({ value, onChange }) {
  return (
    <div className="inline-flex items-center rounded-full border border-gray-200 bg-white">
      <button onClick={() => onChange(value - 1)} className="grid h-9 w-9 place-items-center rounded-full text-gray-500 hover:bg-gray-100" aria-label="Moins">
        <Minus size={14} />
      </button>
      <span className="w-8 text-center text-sm font-bold">{value}</span>
      <button onClick={() => onChange(value + 1)} className="grid h-9 w-9 place-items-center rounded-full text-gray-500 hover:bg-gray-100" aria-label="Plus">
        <Plus size={14} />
      </button>
    </div>
  )
}

export default function Cart() {
  const { items, update, remove, subtotal, count, clear } = useCart()
  const { t } = useSite()
  const fee = Number(t('delivery.fee', '1000'))

  if (!items.length) {
    return (
      <section className="container-x flex min-h-[80vh] flex-col items-center justify-center pt-28 pb-16 text-center">
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="grid h-28 w-28 place-items-center rounded-full bg-brand-50 text-brand-500">
          <ShoppingBag size={48} />
        </motion.span>
        <h1 className="mt-8 text-3xl font-extrabold">Votre panier est vide</h1>
        <p className="mt-3 max-w-md text-gray-500">Vous n’avez encore ajouté aucun produit. Parcourez notre catalogue pour faire votre choix.</p>
        <Link to="/products" className="btn-primary mt-8">Découvrir nos produits <ArrowRight size={16} /></Link>
      </section>
    )
  }

  return (
    <section className="bg-gray-50/70 pt-32 pb-20 lg:pt-36">
      <div className="container-x">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold md:text-4xl">Mon panier</h1>
            <p className="mt-1 text-gray-500">{count} article{count > 1 ? 's' : ''}</p>
          </div>
          <button onClick={clear} className="text-sm font-semibold text-gray-400 hover:text-accent-500">Vider le panier</button>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  className="flex items-center gap-4 rounded-3xl bg-white p-4 shadow-sm sm:gap-6 sm:p-5"
                >
                  <img src={item.imageUrl || undefined} alt={item.name} className="h-20 w-20 shrink-0 rounded-2xl object-cover sm:h-24 sm:w-24" />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-bold">{item.name}</h3>
                    <p className="text-sm text-gray-500">{formatPrice(item.price)} / {item.unit?.toLowerCase()}</p>
                    <div className="mt-3 sm:hidden"><QtyControl value={item.quantity} onChange={(q) => update(item.id, q)} /></div>
                  </div>
                  <div className="hidden sm:block"><QtyControl value={item.quantity} onChange={(q) => update(item.id, q)} /></div>
                  <p className="w-28 text-right font-extrabold text-brand-600">{formatPrice(item.price * item.quantity)}</p>
                  <button onClick={() => remove(item.id)} className="grid h-9 w-9 place-items-center rounded-full text-gray-300 hover:bg-red-50 hover:text-accent-500" aria-label="Retirer">
                    <Trash2 size={18} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            <Link to="/products" className="inline-flex items-center gap-2 pt-2 font-semibold text-brand-600">
              <ArrowLeft size={16} /> Continuer mes achats
            </Link>
          </div>

          <aside className="h-fit rounded-3xl bg-white p-6 shadow-sm lg:sticky lg:top-28">
            <h2 className="text-xl font-bold">Récapitulatif</h2>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-gray-500">Sous-total</dt><dd className="font-semibold">{formatPrice(subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Livraison à domicile</dt><dd className="font-semibold">{formatPrice(fee)}</dd></div>
              <p className="text-xs text-gray-400">Retrait gratuit en agence possible à l’étape suivante.</p>
              <div className="flex justify-between border-t border-dashed border-gray-200 pt-4 text-base">
                <dt className="font-bold">Total estimé</dt>
                <dd className="text-xl font-extrabold text-brand-600">{formatPrice(subtotal + fee)}</dd>
              </div>
            </dl>
            <Link to="/checkout" className="btn-primary mt-6 w-full !py-4">Passer la commande <ArrowRight size={16} /></Link>
          </aside>
        </div>
      </div>
    </section>
  )
}
