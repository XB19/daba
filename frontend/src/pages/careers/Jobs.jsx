import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, BriefcaseBusiness, Building2, CalendarClock, FileUser, HeartHandshake, MapPin, Search, Sprout, TrendingUp } from 'lucide-react'
import { PageHeader, Reveal, SectionHeading } from '../../components/ui'
import { api, formatDate } from '../../lib/api'

const PERKS = [
  { icon: Sprout, title: 'Un secteur porteur', text: 'Participez au développement de l’agroalimentaire togolais.' },
  { icon: TrendingUp, title: 'Évoluer avec nous', text: 'Formation sur le terrain et responsabilités qui grandissent avec vous.' },
  { icon: HeartHandshake, title: 'Un esprit d’équipe', text: 'Une entreprise à taille humaine, exigeante et solidaire.' },
]

export function OfferMeta({ offer, light = false }) {
  const tone = light ? 'text-white/70' : 'text-gray-500'
  return (
    <div className={`flex flex-wrap gap-x-5 gap-y-2 text-sm ${tone}`}>
      {offer.location && <span className="flex items-center gap-1.5"><MapPin size={15} className="text-brand-500" /> {offer.location}</span>}
      {offer.department && <span className="flex items-center gap-1.5"><Building2 size={15} className="text-brand-500" /> {offer.department}</span>}
      {offer.deadline && <span className="flex items-center gap-1.5"><CalendarClock size={15} className="text-brand-500" /> Jusqu’au {formatDate(offer.deadline, false)}</span>}
    </div>
  )
}

export default function Jobs() {
  const [offers, setOffers] = useState(null)
  const [q, setQ] = useState('')
  const [contract, setContract] = useState('all')

  useEffect(() => {
    api.get('/public/jobs').then((r) => setOffers(r.data)).catch(() => setOffers([]))
  }, [])

  const contracts = useMemo(() => [...new Set((offers || []).map((o) => o.contractType).filter(Boolean))], [offers])
  const list = useMemo(() => {
    const s = q.trim().toLowerCase()
    return (offers || [])
      .filter((o) => contract === 'all' || o.contractType === contract)
      .filter((o) => !s || [o.title, o.department, o.location, o.summary].some((v) => v?.toLowerCase().includes(s)))
  }, [offers, q, contract])

  return (
    <>
      <PageHeader
        title="Offres d’emploi"
        text="Rejoignez une équipe engagée pour une production locale saine et de qualité, de l’élevage jusqu’à la distribution."
        crumb="Carrière · Offres d’emploi"
        image="/images/elevage-poules.jpg"
      />

      <section className="py-14 md:py-20">
        <div className="container-x">
          {offers && offers.length > 0 && (
            <div className="mb-10 flex flex-col gap-3 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search size={16} className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Poste, service, ville…" className="input !rounded-full !py-2.5 pl-10" />
              </div>
              <div className="no-scrollbar flex gap-2 overflow-x-auto">
                {['all', ...contracts].map((c) => (
                  <button
                    key={c}
                    onClick={() => setContract(c)}
                    className={`relative shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${contract === c ? 'text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    {contract === c && <motion.span layoutId="contract-pill" className="absolute inset-0 rounded-full bg-brand-500 shadow-md shadow-brand-500/30" />}
                    <span className="relative">{c === 'all' ? 'Tous les contrats' : c}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {!offers ? (
            <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-36 animate-pulse rounded-3xl bg-gray-100" />)}</div>
          ) : list.length ? (
            <motion.div layout className="space-y-4">
              <AnimatePresence mode="popLayout">
                {list.map((o, i) => (
                  <motion.div key={o.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.05 }}>
                    <Link
                      to={`/careers/jobs/${o.id}`}
                      className="group flex flex-col gap-5 rounded-3xl border border-gray-100 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-[0_25px_50px_-20px_rgba(15,26,18,0.25)] sm:flex-row sm:items-center sm:p-8"
                    >
                      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-500 group-hover:text-white">
                        <BriefcaseBusiness size={26} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-xl font-bold">{o.title}</h3>
                          {o.contractType && <span className="rounded-full bg-sun-400/20 px-3 py-1 text-xs font-bold text-amber-700">{o.contractType}</span>}
                        </div>
                        {o.summary && <p className="mt-2 line-clamp-2 text-gray-500">{o.summary}</p>}
                        <div className="mt-3"><OfferMeta offer={o} /></div>
                      </div>
                      <span className="inline-flex shrink-0 items-center gap-2 font-semibold text-brand-600 transition-all group-hover:gap-3">
                        Voir l’offre <ArrowRight size={18} />
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <Reveal className="rounded-[2.5rem] border border-dashed border-gray-200 bg-gradient-to-b from-brand-50/50 to-white px-6 py-16 text-center">
              <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-white text-brand-500 shadow-lg"><BriefcaseBusiness size={36} /></span>
              <h3 className="mt-6 text-2xl font-extrabold">{offers.length ? 'Aucune offre ne correspond' : 'Aucune offre ouverte pour le moment'}</h3>
              <p className="mx-auto mt-3 max-w-lg text-gray-500">
                {offers.length
                  ? 'Essayez un autre mot-clé ou type de contrat.'
                  : 'Nous n’avons pas de poste ouvert actuellement, mais nous sommes toujours heureux de découvrir de nouveaux talents.'}
              </p>
              <Link to="/careers/spontaneous" className="btn-primary mt-8"><FileUser size={18} /> Déposer une candidature spontanée</Link>
            </Reveal>
          )}
        </div>
      </section>

      <section className="section bg-brand-50/50">
        <div className="container-x">
          <SectionHeading eyebrow="Travailler chez DABA" title="Pourquoi nous rejoindre ?" />
          <div className="grid gap-6 md:grid-cols-3">
            {PERKS.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} delay={i * 0.1}>
                <div className="card group h-full p-8 transition hover:-translate-y-1.5">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-500 text-white shadow-lg shadow-brand-500/30 transition group-hover:scale-110"><Icon size={26} /></span>
                  <h3 className="mt-6 text-xl font-bold">{title}</h3>
                  <p className="mt-3 leading-relaxed text-gray-500">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-12 flex flex-col items-center justify-between gap-6 rounded-3xl bg-brand-950 p-8 text-white sm:flex-row sm:p-10">
            <div>
              <h3 className="text-2xl font-bold">Vous ne trouvez pas le poste idéal ?</h3>
              <p className="mt-1 text-white/70">Envoyez-nous votre profil : nous vous contacterons dès qu’une opportunité se présente.</p>
            </div>
            <Link to="/careers/spontaneous" className="btn-accent shrink-0">Candidature spontanée <ArrowRight size={16} /></Link>
          </Reveal>
        </div>
      </section>
    </>
  )
}
