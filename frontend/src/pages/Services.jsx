import { Cpu, ScanSearch, ShieldCheck } from 'lucide-react'
import { DynamicIcon, PageHeader, Reveal, SectionHeading } from '../components/ui'
import { CallToAction } from './Home'
import { useSite } from '../context/SiteContext'

const TRUST = [
  { icon: ScanSearch, title: 'Traçabilité', text: 'L’origine de chaque produit est connue et suivie tout au long de la chaîne.' },
  { icon: ShieldCheck, title: 'Hygiène', text: 'Nos installations appliquent des règles sanitaires strictes et contrôlées.' },
  { icon: Cpu, title: 'Innovation', text: 'Des équipements modernes pour une transformation précise et régulière.' },
]

export default function Services() {
  const { services } = useSite()
  return (
    <>
      <PageHeader
        title="Nos services"
        text="Une expertise complète, de l’élevage jusqu’à votre assiette, pour garantir fraîcheur et qualité à chaque étape."
        crumb="Services"
        image="/images/ferme.jpg"
      />

      <section className="section">
        <div className="container-x space-y-24">
          {services.map((s, i) => (
            <div key={s.id} className="grid items-center gap-12 lg:grid-cols-2">
              <Reveal x={i % 2 ? 40 : -40} y={0} className={i % 2 ? 'lg:order-2' : ''}>
                <div className="group relative overflow-hidden rounded-[2.5rem] shadow-2xl">
                  <img src={s.imageUrl || undefined} alt={s.title} className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <span className="absolute top-6 left-6 rounded-full bg-white/90 px-4 py-1.5 text-sm font-black text-brand-700 backdrop-blur">
                    0{i + 1}
                  </span>
                </div>
              </Reveal>
              <Reveal x={i % 2 ? -40 : 40} y={0}>
                <span className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-500 text-white shadow-xl shadow-brand-500/30">
                  <DynamicIcon name={s.icon} size={30} />
                </span>
                <h2 className="title-xl mt-6">{s.title}</h2>
                <p className="mt-5 text-lg leading-relaxed text-gray-500">{s.description}</p>
              </Reveal>
            </div>
          ))}
        </div>
      </section>

      <section className="section bg-brand-950">
        <div className="container-x">
          <SectionHeading light eyebrow="Nos garanties" title="Pourquoi faire confiance à nos services ?" />
          <div className="grid gap-6 md:grid-cols-3">
            {TRUST.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} delay={i * 0.1}>
                <div className="h-full rounded-3xl border border-white/10 bg-white/5 p-8 text-center transition hover:-translate-y-1 hover:bg-white/10">
                  <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-500/20 text-brand-300 ring-8 ring-brand-500/10">
                    <Icon size={28} />
                  </span>
                  <h3 className="mt-6 text-xl font-bold text-white">{title}</h3>
                  <p className="mt-3 text-white/60">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CallToAction />
    </>
  )
}
