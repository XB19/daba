import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CircleCheck, Gift, ListChecks, UserCheck } from 'lucide-react'
import { PageHeader, Reveal, Spinner } from '../../components/ui'
import { api } from '../../lib/api'
import ApplicationForm from './ApplicationForm'
import { OfferMeta } from './Jobs'

const lines = (text) => (text || '').split('\n').map((l) => l.replace(/^[-•*]\s*/, '').trim()).filter(Boolean)

function Block({ icon: Icon, title, items }) {
  if (!items.length) return null
  return (
    <Reveal className="card p-6 sm:p-8">
      <h2 className="flex items-center gap-3 text-xl font-bold">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600"><Icon size={20} /></span>
        {title}
      </h2>
      <ul className="mt-5 space-y-3">
        {items.map((it) => (
          <li key={it} className="flex items-start gap-3 text-gray-600">
            <CircleCheck size={18} className="mt-0.5 shrink-0 text-brand-500" />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </Reveal>
  )
}

export default function JobDetail() {
  const { id } = useParams()
  const [offer, setOffer] = useState(undefined)

  useEffect(() => {
    api.get(`/public/jobs/${id}`).then((r) => setOffer(r.data)).catch(() => setOffer(null))
  }, [id])

  if (offer === undefined) {
    return <div className="grid min-h-screen place-items-center"><Spinner className="h-8 w-8 text-brand-500" /></div>
  }

  if (offer === null) {
    return (
      <section className="container-x flex min-h-[85vh] flex-col items-center justify-center pt-28 text-center">
        <h1 className="text-3xl font-extrabold">Cette offre n’est plus disponible</h1>
        <p className="mt-3 max-w-md text-gray-500">Le poste a peut-être été pourvu. Consultez nos autres offres ou envoyez une candidature spontanée.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/careers/jobs" className="btn-primary">Voir les offres</Link>
          <Link to="/careers/spontaneous" className="btn-outline">Candidature spontanée</Link>
        </div>
      </section>
    )
  }

  return (
    <>
      <PageHeader title={offer.title} text={offer.summary} crumb="Carrière · Offre d’emploi" image="/images/elevage-poules.jpg" />

      <section className="py-14 md:py-20">
        <div className="container-x">
          <Link to="/careers/jobs" className="mb-8 inline-flex items-center gap-2 font-semibold text-brand-600 transition-all hover:gap-3">
            <ArrowLeft size={16} /> Toutes les offres
          </Link>

          <div className="grid gap-8 lg:grid-cols-5">
            <div className="space-y-6 lg:col-span-3">
              <div className="flex flex-wrap items-center gap-3 rounded-3xl bg-brand-950 p-6 text-white">
                {offer.contractType && <span className="rounded-full bg-sun-400 px-3 py-1 text-xs font-black text-ink uppercase">{offer.contractType}</span>}
                <OfferMeta offer={offer} light />
              </div>
              <Block icon={ListChecks} title="Vos missions" items={lines(offer.missions)} />
              <Block icon={UserCheck} title="Profil recherché" items={lines(offer.requirements)} />
              <Block icon={Gift} title="Ce que nous offrons" items={lines(offer.benefits)} />
            </div>
            <div className="lg:col-span-2">
              <div className="lg:sticky lg:top-28">
                <ApplicationForm offer={offer} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
