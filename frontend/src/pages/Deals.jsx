import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight, Construction, CreditCard, Gift, Lightbulb, Phone, X, ZoomIn } from 'lucide-react'
import { Reveal } from '../components/ui'
import { api, assetUrl } from '../lib/api'

const EASE = [0.22, 1, 0.36, 1]
const fadeUp = (delay) => ({ initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay, ease: EASE } })

const withImage = (d) => ({ ...d, imageUrl: assetUrl(d.imageUrl) })

/** Ferme une fenêtre avec Échap (et gère les flèches pour la visionneuse). */
function useKeys(active, handlers) {
  useEffect(() => {
    if (!active) return
    const onKey = (e) => handlers[e.key]?.()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, handlers])
}

function RechargeModal({ open, onClose }) {
  useKeys(open, { Escape: onClose })
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/60 p-5 backdrop-blur-[5px]" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="zc-title"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="relative w-full max-w-[440px] rounded-3xl bg-white px-10 py-12 text-center shadow-[0_32px_100px_rgba(0,0,0,0.3)]"
          >
            <button onClick={onClose} className="absolute top-4 right-4 grid text-gray-400 hover:text-ink" aria-label="Fermer"><X size={20} /></button>
            <div className="mx-auto mb-5 grid h-[72px] w-[72px] place-items-center rounded-[20px] bg-gradient-to-br from-[#d4a94a] to-[#b8892a] text-white shadow-[0_8px_24px_rgba(184,137,42,0.4)]">
              <CreditCard size={32} />
            </div>
            <h2 id="zc-title" className="mb-2 text-2xl font-bold">Recharge ZenCard</h2>
            <p className="mb-6 text-sm text-gray-500">Rechargez votre carte avantages en quelques clics.</p>
            <div className="mb-6 flex flex-col items-center gap-1.5 rounded-[14px] border border-[#f0c040] bg-gradient-to-br from-[#fffbea] to-[#fff3cc] px-6 py-5 text-[#8b6914]">
              <Construction size={30} className="mb-1" />
              <b className="text-base">Service bientôt disponible</b>
              <span className="text-[13px] leading-relaxed text-[#a07820]">La recharge en ligne est en cours de déploiement. Contactez-nous pour toute urgence.</span>
            </div>
            <div className="flex flex-wrap justify-center gap-2.5">
              <Link to="/contact" onClick={onClose} className="inline-flex items-center gap-2 rounded-[10px] bg-brand-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-900">
                <Phone size={16} /> Nous contacter
              </Link>
              <button onClick={onClose} className="inline-flex items-center rounded-[10px] bg-[#f0efe9] px-6 py-3 text-sm font-semibold text-gray-500 transition hover:bg-[#e6e3d8]">Fermer</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Lightbox({ items, index, onClose, onMove }) {
  const item = index !== null ? items[index] : null
  const handlers = { Escape: onClose, ArrowRight: () => onMove(1), ArrowLeft: () => onMove(-1) }
  useKeys(index !== null, handlers)

  return (
    <AnimatePresence>
      {item && (
        <motion.div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/80 px-4 pt-16 pb-6 backdrop-blur-[8px]" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <figure className="relative flex w-[94%] max-w-[640px] flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <button onClick={onClose} className="absolute -top-12 right-0 grid h-[38px] w-[38px] place-items-center rounded-full border border-white/25 bg-white/20 text-white backdrop-blur transition hover:border-accent-500 hover:bg-accent-500" aria-label="Fermer">
              <X size={18} />
            </button>
            {items.length > 1 && (
              <>
                <button onClick={() => onMove(-1)} className="absolute top-1/2 -left-2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/30 sm:-left-16" aria-label="Précédent"><ChevronLeft size={22} /></button>
                <button onClick={() => onMove(1)} className="absolute top-1/2 -right-2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/30 sm:-right-16" aria-label="Suivant"><ChevronRight size={22} /></button>
              </>
            )}
            <AnimatePresence mode="wait">
              <motion.img
                key={item.id}
                src={item.imageUrl}
                alt={item.title}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25, ease: EASE }}
                className="max-h-[80vh] w-full max-w-[600px] rounded-2xl object-contain shadow-[0_32px_100px_rgba(0,0,0,0.5)]"
              />
            </AnimatePresence>
            <figcaption className="mt-4 rounded-full bg-black/35 px-5 py-2 text-center text-sm font-semibold text-white/85 backdrop-blur">
              {item.title}{items.length > 1 && ` · ${index + 1}/${items.length}`}
            </figcaption>
          </figure>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function PosterCard({ deal, onOpen }) {
  return (
    <button
      onClick={onOpen}
      className="group relative block w-full overflow-hidden rounded-[18px] border border-[#e8e6dc] bg-white text-left transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_48px_rgba(13,43,17,0.16)]"
    >
      {deal.badge && (
        <span className="absolute top-3 left-3 z-[2] rounded-full bg-gradient-to-r from-[#d4a94a] to-[#b8892a] px-3 py-1 text-[10px] font-extrabold tracking-[0.12em] text-white uppercase shadow">
          {deal.badge}
        </span>
      )}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img src={deal.imageUrl} alt={deal.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <span className="absolute inset-0 flex items-end gap-1.5 bg-gradient-to-t from-brand-950/80 via-brand-950/10 to-transparent p-5 text-[13px] font-semibold text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
          <ZoomIn size={16} /> Agrandir
        </span>
      </div>
      <span className="flex items-center justify-between gap-2.5 border-t border-[#e8e6dc] px-4 py-3.5 text-brand-600">
        <span className="text-[13.5px] leading-snug font-semibold text-brand-900">{deal.title}</span>
        <ArrowRight size={16} className="shrink-0 transition-transform group-hover:translate-x-1" />
      </span>
    </button>
  )
}

function TextCard({ deal }) {
  const external = deal.ctaUrl && /^https?:/.test(deal.ctaUrl)
  return (
    <div className="h-full rounded-[18px] border border-[#e8e6dc] bg-white p-[26px] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_36px_rgba(13,43,17,0.12)]">
      <div className="mb-3.5 grid h-11 w-11 place-items-center rounded-xl bg-sun-400/20 text-[#b7780a]"><Lightbulb size={22} /></div>
      {deal.badge && <span className="mb-2.5 inline-block rounded-full bg-sun-400 px-2.5 py-0.5 text-[10px] font-extrabold tracking-[0.08em] text-brand-950 uppercase">{deal.badge}</span>}
      <h3 className="mb-2 text-[15.5px] leading-snug font-bold text-brand-900">{deal.title}</h3>
      {deal.summary && <p className="mb-4 text-[13.5px] leading-relaxed text-gray-500">{deal.summary}</p>}
      {deal.ctaUrl && (external ? (
        <a href={deal.ctaUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[13.5px] font-bold text-brand-600 hover:text-accent-500">
          {deal.ctaLabel || 'Voir le détail'} <ArrowRight size={14} />
        </a>
      ) : (
        <Link to={deal.ctaUrl} className="inline-flex items-center gap-1.5 text-[13.5px] font-bold text-brand-600 hover:text-accent-500">
          {deal.ctaLabel || 'Voir le détail'} <ArrowRight size={14} />
        </Link>
      ))}
    </div>
  )
}

export default function Deals() {
  const [deals, setDeals] = useState(null)
  const [recharge, setRecharge] = useState(false)
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    api.get('/public/deals').then((r) => setDeals(r.data.map(withImage))).catch(() => setDeals([]))
  }, [])

  const posters = (deals || []).filter((d) => d.imageUrl)
  const move = useCallback((step) => setLightbox((i) => (i + step + posters.length) % posters.length), [posters.length])
  const closeRecharge = useCallback(() => setRecharge(false), [])
  const closeLightbox = useCallback(() => setLightbox(null), [])

  return (
    <>
      <section
        className="relative overflow-hidden bg-cover bg-center pt-44 pb-20 text-center text-white md:pt-48"
        style={{ backgroundImage: 'linear-gradient(135deg, rgba(31,78,37,.92) 0%, rgba(13,43,17,.96) 100%), url(/images/ferme.jpg)' }}
      >
        <span className="pointer-events-none absolute -top-20 right-[5%] h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(212,169,74,0.18),transparent_65%)]" />
        <span className="pointer-events-none absolute -bottom-16 left-[3%] h-[300px] w-[300px] rounded-full bg-[radial-gradient(circle,rgba(66,182,73,0.2),transparent_65%)]" />
        <div className="container-x relative z-[2]">
          <motion.div className="mb-4 text-[11.5px] font-bold tracking-[0.18em] text-[#d4a94a] uppercase" {...fadeUp(0)}>DABA Togo</motion.div>
          <motion.h1 className="mb-3.5 font-display text-[32px] font-bold md:text-[52px]" {...fadeUp(0.1)}>
            Bons Plans <span className="bg-gradient-to-r from-[#f5d78e] to-[#d4a94a] bg-clip-text text-transparent">&amp;</span> ZenCard
          </motion.h1>
          <motion.p className="mx-auto mb-10 max-w-[480px] text-[16.5px] leading-relaxed text-white/70" {...fadeUp(0.2)}>
            Offres spéciales, promotions et avantages exclusifs sélectionnés pour vous.
          </motion.p>
          <motion.div {...fadeUp(0.35)}>
            <button
              onClick={() => setRecharge(true)}
              className="inline-flex items-center gap-3 rounded-full bg-gradient-to-br from-[#d4a94a] to-[#b8892a] px-9 py-4 font-bold text-white shadow-[0_10px_30px_rgba(184,137,42,0.45)] transition hover:-translate-y-[3px] hover:scale-[1.04]"
            >
              <CreditCard size={20} /> Recharger ma ZenCard
            </button>
          </motion.div>
          <motion.div className="mt-11 flex flex-wrap justify-center gap-8" {...fadeUp(0.5)}>
            <div>
              <b className="block font-display text-[28px] leading-tight font-bold">{deals ? deals.length : '–'}</b>
              <span className="mt-1 block text-[11px] tracking-[0.08em] text-white/50 uppercase">Offres actives</span>
            </div>
            <i className="h-10 w-px self-center bg-white/15" />
            <div>
              <b className="block font-display text-[28px] leading-tight font-bold text-[#d4a94a]">ZenCard</b>
              <span className="mt-1 block text-[11px] tracking-[0.08em] text-white/50 uppercase">Votre carte avantages</span>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-[#f7f6f1] py-[72px]">
        <div className="container-x">
          <Reveal className="mb-11 text-center">
            <span className="mb-2.5 inline-block text-xs font-bold tracking-[0.14em] text-[#b8892a] uppercase">Offres &amp; Promotions</span>
            <h2 className="font-display text-[28px] font-bold md:text-[40px]">Nos bons plans du moment</h2>
          </Reveal>

          {deals === null && (
            <div className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-[440px] animate-pulse rounded-[18px] bg-white" />)}
            </div>
          )}

          {deals?.length === 0 && (
            <div className="py-16 text-center text-gray-400">
              <Gift size={44} className="mx-auto" />
              <p className="mt-3">Aucun bon plan pour le moment. Revenez bientôt !</p>
            </div>
          )}

          {deals?.length > 0 && (
            <div className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
              {deals.map((d, i) => (
                <motion.div key={d.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: (i % 4) * 0.05, ease: EASE }}>
                  {d.imageUrl ? <PosterCard deal={d} onOpen={() => setLightbox(posters.indexOf(d))} /> : <TextCard deal={d} />}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <RechargeModal open={recharge} onClose={closeRecharge} />
      <Lightbox items={posters} index={lightbox} onClose={closeLightbox} onMove={move} />
    </>
  )
}
