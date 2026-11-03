import { Link } from 'react-router-dom'
import { ArrowRight, Factory, Megaphone, Sprout, Truck } from 'lucide-react'
import { PageHeader, Reveal } from '../../components/ui'
import ApplicationForm from './ApplicationForm'

const AREAS = [
  { icon: Sprout, title: 'Élevage & production' },
  { icon: Factory, title: 'Transformation & qualité' },
  { icon: Truck, title: 'Logistique & livraison' },
  { icon: Megaphone, title: 'Commercial & administration' },
]

const STEPS = [
  'Vous envoyez votre CV et quelques mots sur votre projet.',
  'Notre équipe étudie votre profil avec attention.',
  'Nous vous recontactons dès qu’un poste correspond à votre profil.',
]

export default function Spontaneous() {
  return (
    <>
      <PageHeader
        title="Candidature spontanée"
        text="Aucune offre ne correspond à votre profil ? Présentez-vous : nous recherchons des talents passionnés par l’agroalimentaire."
        crumb="Carrière · Candidature spontanée"
        image="/images/ferme.jpg"
      />

      <section className="section">
        <div className="container-x grid gap-10 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-2">
            <Reveal>
              <span className="eyebrow">Nos métiers</span>
              <h2 className="title-xl mt-4 !text-3xl md:!text-4xl">Des talents à chaque étape</h2>
              <p className="mt-4 text-gray-500">De la ferme jusqu’à la livraison, nos équipes couvrent toute la chaîne de valeur.</p>
            </Reveal>
            <div className="grid grid-cols-2 gap-3">
              {AREAS.map(({ icon: Icon, title }, i) => (
                <Reveal key={title} delay={i * 0.06}>
                  <div className="group h-full rounded-2xl border border-gray-100 p-4 transition hover:border-brand-200 hover:bg-brand-50/50">
                    <Icon size={22} className="text-brand-600 transition group-hover:scale-110" />
                    <p className="mt-3 text-sm font-bold">{title}</p>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal className="rounded-3xl bg-brand-950 p-6 text-white">
              <h3 className="font-bold">Comment ça se passe ?</h3>
              <ol className="mt-4 space-y-4">
                {STEPS.map((s, i) => (
                  <li key={s} className="flex gap-3 text-sm text-white/75">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-500 text-xs font-black text-white">{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ol>
            </Reveal>
            <Link to="/careers/jobs" className="inline-flex items-center gap-2 font-semibold text-brand-600 transition-all hover:gap-3">
              Voir nos offres d’emploi <ArrowRight size={16} />
            </Link>
          </div>

          <Reveal delay={0.1} className="lg:col-span-3">
            <ApplicationForm />
          </Reveal>
        </div>
      </section>
    </>
  )
}
