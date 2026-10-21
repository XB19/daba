import { Eye, Gem, Target, TrendingUp, Users, Sprout } from 'lucide-react'
import { PageHeader, Reveal, SectionHeading } from '../components/ui'
import { CallToAction } from './Home'
import { useSite } from '../context/SiteContext'

export default function About() {
  const { t } = useSite()
  const pillars = [
    { icon: Target, title: 'Notre mission', text: t('about.mission'), color: 'bg-brand-500' },
    { icon: Eye, title: 'Notre vision', text: t('about.vision'), color: 'bg-accent-500' },
    { icon: Gem, title: 'Nos valeurs', text: t('about.values'), color: 'bg-sun-400' },
  ]
  const goalIcons = [TrendingUp, Users, Sprout]
  const goals = [1, 2, 3]
    .map((n) => ({ title: t(`about.goal.${n}.title`), text: t(`about.goal.${n}.text`), icon: goalIcons[n - 1] }))
    .filter((g) => g.title)

  return (
    <>
      <PageHeader title="À propos de DABA" text={t('about.intro')} image={t('about.image')} crumb="À propos" />

      <section className="section">
        <div className="container-x grid items-center gap-16 lg:grid-cols-2">
          <Reveal x={-40} y={0} className="relative">
            <img src={t('about.image') || undefined} alt="Notre histoire" className="aspect-[4/3] w-full rounded-[2.5rem] object-cover shadow-2xl" />
            <div className="absolute -right-6 -bottom-6 hidden rounded-3xl bg-brand-500 p-8 text-white shadow-2xl sm:block">
              <p className="text-5xl font-black">100%</p>
              <p className="mt-1 text-sm text-white/80">Made in Togo</p>
            </div>
          </Reveal>
          <Reveal x={40} y={0}>
            <span className="eyebrow">Notre histoire</span>
            <h2 className="title-xl mt-4">De la ferme à votre table, avec exigence</h2>
            <p className="mt-6 text-lg leading-relaxed text-gray-600">{t('about.history.1')}</p>
            <p className="mt-4 text-lg leading-relaxed text-gray-600">{t('about.history.2')}</p>
          </Reveal>
        </div>
      </section>

      <section className="section bg-brand-50/50">
        <div className="container-x">
          <SectionHeading eyebrow="Ce qui nous guide" title="Mission, vision et valeurs" />
          <div className="grid gap-6 md:grid-cols-3">
            {pillars.map(({ icon: Icon, title, text, color }, i) => (
              <Reveal key={title} delay={i * 0.1}>
                <div className="card group h-full p-8 transition hover:-translate-y-1.5">
                  <span className={`grid h-14 w-14 place-items-center rounded-2xl text-white shadow-lg transition group-hover:scale-110 ${color}`}>
                    <Icon size={26} />
                  </span>
                  <h3 className="mt-6 text-xl font-bold">{title}</h3>
                  <p className="mt-3 leading-relaxed text-gray-500">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-x">
          <SectionHeading eyebrow="Cap sur l’avenir" title="Nos objectifs" />
          <div className="relative grid gap-6 md:grid-cols-3">
            {goals.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} delay={i * 0.1}>
                <div className="relative h-full overflow-hidden rounded-3xl border border-gray-100 p-8 transition hover:border-brand-200 hover:shadow-xl">
                  <span className="absolute -top-4 -right-2 font-display text-[7rem] leading-none font-black text-brand-50">0{i + 1}</span>
                  <Icon className="relative text-brand-600" size={30} />
                  <h3 className="relative mt-5 text-xl font-bold">{title}</h3>
                  <p className="relative mt-3 text-gray-500">{text}</p>
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
