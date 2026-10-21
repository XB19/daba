import { Link, useLocation, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CircleCheck } from 'lucide-react'
import { formatPrice, PAYMENT_LABELS } from '../lib/api'

export default function OrderSuccess() {
  const { reference } = useParams()
  const order = useLocation().state?.order

  return (
    <section className="container-x flex min-h-[85vh] items-center justify-center pt-28 pb-16">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="card w-full max-w-xl p-8 text-center sm:p-12">
        <motion.span
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-brand-500 text-white shadow-2xl shadow-brand-500/40"
        >
          <CircleCheck size={48} />
        </motion.span>
        <h1 className="mt-8 text-3xl font-extrabold">Merci pour votre commande !</h1>
        <p className="mt-3 text-gray-500">Notre équipe vous contactera très vite pour confirmer la livraison.</p>
        <div className="mt-8 rounded-2xl bg-brand-50 p-5">
          <p className="text-xs font-semibold tracking-widest text-brand-700 uppercase">Référence</p>
          <p className="mt-1 font-mono text-2xl font-black">{reference}</p>
        </div>
        {order && (
          <dl className="mt-6 grid grid-cols-2 gap-4 text-left text-sm">
            <div className="rounded-2xl border border-gray-100 p-4"><dt className="text-gray-500">Total</dt><dd className="font-bold text-brand-600">{formatPrice(order.total)}</dd></div>
            <div className="rounded-2xl border border-gray-100 p-4"><dt className="text-gray-500">Paiement</dt><dd className="font-bold">{PAYMENT_LABELS[order.paymentMethod]}</dd></div>
          </dl>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/products" className="btn-primary">Continuer mes achats</Link>
          <Link to="/" className="btn-outline">Retour à l’accueil</Link>
        </div>
      </motion.div>
    </section>
  )
}
