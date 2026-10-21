import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../lib/api'

export default function ProductCard({ product, index = 0 }) {
  const { add } = useCart()
  const out = !product.available

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.07 }}
      className="group flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_25px_50px_-20px_rgba(15,26,18,0.25)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={product.imageUrl || undefined}
          alt={product.name}
          loading="lazy"
          className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 ${out ? 'grayscale' : ''}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        {product.category && (
          <span className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold tracking-wide text-brand-700 uppercase backdrop-blur">
            {product.category.name}
          </span>
        )}
        {out && (
          <span className="absolute top-4 right-4 rounded-full bg-accent-500 px-3 py-1 text-[11px] font-bold text-white uppercase">
            Rupture
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold leading-snug">{product.name}</h3>
        <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-gray-500">{product.description}</p>
        <div className="mt-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-xl font-extrabold text-brand-600">{formatPrice(product.price)}</p>
            {product.unit && <p className="text-xs text-gray-400">par {product.unit.toLowerCase()}</p>}
          </div>
          <button
            disabled={out}
            onClick={() => add(product)}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/25 transition-all hover:bg-brand-600 active:scale-95 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
          >
            <Plus size={16} /> Ajouter
          </button>
        </div>
      </div>
    </motion.article>
  )
}
