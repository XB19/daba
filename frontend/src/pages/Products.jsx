import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { PackageX, Search } from 'lucide-react'
import { PageHeader } from '../components/ui'
import ProductCard from '../components/ProductCard'
import { useSite } from '../context/SiteContext'

const SORTS = {
  default: { label: 'Pertinence', fn: (a, b) => a.id - b.id },
  'price-asc': { label: 'Prix croissant', fn: (a, b) => a.price - b.price },
  'price-desc': { label: 'Prix décroissant', fn: (a, b) => b.price - a.price },
  name: { label: 'Nom (A-Z)', fn: (a, b) => a.name.localeCompare(b.name) },
}

export default function Products() {
  const { products, categories, loading } = useSite()
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('default')
  const active = params.get('category') || 'all'

  const setCategory = (id) => {
    if (id === 'all') params.delete('category')
    else params.set('category', id)
    setParams(params, { replace: true })
  }

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products
      .filter((p) => active === 'all' || String(p.category?.id) === active)
      .filter((p) => !q || p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q))
      .sort(SORTS[sort].fn)
  }, [products, active, query, sort])

  const countFor = (id) => products.filter((p) => String(p.category?.id) === String(id)).length

  return (
    <>
      <PageHeader
        title="Notre catalogue"
        text="Volailles fraîches, découpes, charcuteries et marinades maison : tout est préparé localement, avec soin."
        crumb="Produits"
        image="/images/charcuterie.jpg"
      />

      <section className="py-14 md:py-20">
        <div className="container-x">
          {/* Barre de filtres */}
          <div className="sticky top-20 z-30 -mx-4 mb-10 border-b border-gray-100 bg-white/90 px-4 py-4 backdrop-blur-xl sm:mx-0 sm:rounded-3xl sm:border sm:px-5 sm:shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
              <div className="no-scrollbar flex flex-1 gap-2 overflow-x-auto md:flex-wrap">
                {[{ id: 'all', name: 'Tous les produits', n: products.length }, ...categories.map((c) => ({ ...c, n: countFor(c.id) }))].map((c) => {
                  const selected = String(c.id) === active
                  return (
                    <button
                      key={c.id}
                      onClick={() => setCategory(String(c.id))}
                      className={`relative shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                        selected ? 'text-white' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {selected && <motion.span layoutId="cat-pill" className="absolute inset-0 rounded-full bg-brand-500 shadow-md shadow-brand-500/30" />}
                      <span className="relative flex items-center gap-2">
                        {c.name}
                        <span className={`rounded-full px-1.5 text-[11px] ${selected ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>{c.n}</span>
                      </span>
                    </button>
                  )
                })}
              </div>
              <div className="flex gap-3">
                <div className="relative flex-1 xl:w-64">
                  <Search size={16} className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
                  <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un produit..." className="input !rounded-full !py-2.5 pl-10" />
                </div>
                <select value={sort} onChange={(e) => setSort(e.target.value)} className="input !w-auto !rounded-full !py-2.5">
                  {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          <p className="mb-6 text-sm text-gray-500">
            <span className="font-bold text-ink">{list.length}</span> produit{list.length > 1 ? 's' : ''} trouvé{list.length > 1 ? 's' : ''}
          </p>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-96 animate-pulse rounded-3xl bg-gray-100" />)}
            </div>
          ) : list.length ? (
            <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <AnimatePresence mode="popLayout">
                {list.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="rounded-3xl border border-dashed border-gray-200 py-20 text-center">
              <PackageX size={48} className="mx-auto text-gray-300" />
              <h3 className="mt-4 text-xl font-bold">Aucun produit trouvé</h3>
              <p className="mt-2 text-gray-500">Essayez de modifier vos filtres ou votre recherche.</p>
              <button onClick={() => { setQuery(''); setCategory('all') }} className="btn-primary mt-6">Réinitialiser les filtres</button>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
