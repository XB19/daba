import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowUpRight, BadgeCheck, CircleCheck, Leaf, Quote, ShieldCheck, Snowflake, Truck } from 'lucide-react'
import { DynamicIcon, Reveal, SectionHeading, Stars } from '../components/ui'
import ProductCard from '../components/ProductCard'
import { useSite } from '../context/SiteContext'

const FEATURES = [
  { icon: Snowflake, title: 'Produits frais', text: 'Chaîne du froid respectée jusqu’à votre porte.' },
  { icon: ShieldCheck, title: 'Contrôle qualité', text: 'Vérifications sanitaires à chaque étape.' },
  { icon: Truck, title: 'Livraison rapide', text: 'Votre commande livrée en moins de 24h.' },
  { icon: Leaf, title: 'Production locale', text: 'Élevé et transformé ici, au Togo.' },
]

function Hero() {
  const { t } = useSite()
  return (
    <section className="relative isolate overflow-hidden bg-brand-950 pt-36 pb-28 text-white lg:pt-44 lg:pb-36">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(66,182,73,0.35),transparent_55%)]" />
      <div className="absolute inset-0 -z-10 opacity-[0.06] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:22px_22px]" />
      <div className="container-x grid items-center gap-16 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold text-brand-200 backdrop-blur">
            <span className="h-2 w-2 animate-pulse rounded-full bg-brand-400" />
            {t('hero.badge')}
          </span>
          <h1 className="mt-6 font-display text-4xl leading-[1.1] font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            {t('hero.title')}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">{t('hero.subtitle')}</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/products" className="btn-accent !px-8 !py-4 text-base">
              Commander maintenant <ArrowRight size={18} />
            </Link>
            <Link to="/about" className="btn-ghost !px-8 !py-4 text-base">Découvrir DABA</Link>
          </div>
          <div className="mt-12 flex items-center gap-6 text-sm text-white/60">
            <div className="flex -space-x-3">
              {['bg-brand-400', 'bg-sun-400', 'bg-accent-500'].map((c) => (
                <span key={c} className={`grid h-10 w-10 place-items-center rounded-full border-2 border-brand-950 ${c}`}>
                  <BadgeCheck size={18} className="text-white" />
                </span>
              ))}
            </div>
            <p>Restaurants, hôtels et familles<br />nous font confiance chaque jour.</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.15 }}
          className="relative mx-auto w-full max-w-lg"
        >
          <div className="absolute -inset-6 rounded-[3rem] bg-gradient-to-tr from-brand-500/40 to-sun-400/20 blur-2xl" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] border border-white/10 shadow-2xl">
            <img src={t('hero.image') || undefined} alt="Produits DABA" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-950/60 to-transparent" />
          </div>
          <div className="absolute -bottom-6 left-2 animate-float rounded-2xl bg-white p-4 text-ink shadow-2xl sm:-left-10">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-600"><Truck /></span>
              <div>
                <p className="text-xs text-gray-500">Livraison</p>
                <p className="font-bold">En moins de 24h</p>
              </div>
            </div>
          </div>
          <div className="absolute -top-4 right-2 animate-float rounded-2xl bg-white p-4 text-ink shadow-2xl [animation-delay:1.5s] sm:-right-8">
            <p className="text-xs text-gray-500">Qualité contrôlée</p>
            <Stars value={5} />
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function FeatureStrip() {
  return (
    <section className="relative z-10 -mt-14">
      <div className="container-x">
        <div className="grid gap-4 rounded-3xl bg-white p-4 shadow-[0_30px_60px_-25px_rgba(15,26,18,0.25)] sm:grid-cols-2 lg:grid-cols-4 lg:p-6">
          {FEATURES.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 0.08} className="group flex items-start gap-4 rounded-2xl p-4 transition hover:bg-brand-50">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-500 text-white shadow-lg shadow-brand-500/30 transition group-hover:rotate-6">
                <Icon size={22} />
              </span>
              <div>
                <h3 className="font-bold">{title}</h3>
                <p className="mt-1 text-sm text-gray-500">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function Expertise() {
  const { t, services } = useSite()
  const items = services.filter((s) => s.showOnHome).slice(0, 4)
  return (
    <section className="section">
      <div className="container-x">
        <div className="mb-14 grid items-end gap-8 lg:grid-cols-2">
          <Reveal>
            <span className="eyebrow">Nos domaines d'expertise</span>
            <h2 className="title-xl mt-4">{t('intro.title')}</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-lg leading-relaxed text-gray-500">{t('intro.text')}</p>
            <Link to="/services" className="mt-5 inline-flex items-center gap-2 font-semibold text-brand-600 hover:gap-3 transition-all">
              Tous nos services <ArrowRight size={18} />
            </Link>
          </Reveal>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((s, i) => (
            <Reveal key={s.id} delay={i * 0.08}>
              <Link to="/services" className="group relative block h-96 overflow-hidden rounded-3xl">
                <img src={s.imageUrl || undefined} alt={s.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <span className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-white/15 backdrop-blur transition group-hover:bg-brand-500">
                    <DynamicIcon name={s.icon} size={22} />
                  </span>
                  <h3 className="text-xl font-bold">{s.title}</h3>
                  <p className="mt-2 max-h-0 overflow-hidden text-sm text-white/75 opacity-0 transition-all duration-500 group-hover:max-h-32 group-hover:opacity-100">
                    {s.description}
                  </p>
                </div>
                <span className="absolute top-5 right-5 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-ink opacity-0 transition-all duration-500 group-hover:opacity-100">
                  <ArrowUpRight size={18} />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeaturedProducts() {
  const { products } = useSite()
  // Produits mis en avant d'abord, complétés jusqu'à 8 pour garder une grille pleine
  const list = [...products.filter((p) => p.featured), ...products.filter((p) => !p.featured && p.available)].slice(0, 8)
  return (
    <section className="section bg-gradient-to-b from-brand-50/60 to-white">
      <div className="container-x">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <span className="eyebrow">Best-sellers</span>
            <h2 className="title-xl mt-4">Nos produits les plus demandés</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <Link to="/products" className="btn-outline">Voir tout le catalogue <ArrowRight size={16} /></Link>
          </Reveal>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </div>
    </section>
  )
}

function WhyUs() {
  const { t } = useSite()
  const items = t('why.items').split('\n').filter(Boolean)
  const stats = [1, 2, 3, 4].map((n) => ({ value: t(`stats.${n}.value`), label: t(`stats.${n}.label`) })).filter((s) => s.value)
  return (
    <section className="section overflow-hidden">
      <div className="container-x grid items-center gap-16 lg:grid-cols-2">
        <Reveal x={-40} y={0} className="relative">
          <div className="absolute -top-8 -left-8 h-40 w-40 rounded-full bg-sun-400/30 blur-2xl" />
          <img src={t('why.image') || undefined} alt="Élevage DABA" className="relative aspect-[5/6] w-full rounded-[2.5rem] object-cover shadow-2xl" />
          <div className="absolute -right-4 -bottom-8 grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-gray-100 shadow-2xl sm:-right-8">
            {stats.map((s) => (
              <div key={s.label} className="bg-white px-6 py-5">
                <p className="text-3xl font-black text-brand-600">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal x={40} y={0}>
          <span className="eyebrow">Notre engagement</span>
          <h2 className="title-xl mt-4">{t('why.title')}</h2>
          <p className="mt-4 text-lg text-gray-500">{t('why.text')}</p>
          <ul className="mt-8 space-y-4">
            {items.map((item, i) => (
              <motion.li
                key={item}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:border-brand-200 hover:shadow-md"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
                  <CircleCheck size={20} />
                </span>
                <span className="font-semibold">{item}</span>
              </motion.li>
            ))}
          </ul>
          <Link to="/products" className="btn-primary mt-10">Commander maintenant <ArrowRight size={16} /></Link>
        </Reveal>
      </div>
    </section>
  )
}

function Testimonials() {
  const { testimonials } = useSite()
  if (!testimonials.length) return null
  return (
    <section className="section relative overflow-hidden bg-brand-950">
      <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" />
      <div className="container-x relative">
        <SectionHeading light eyebrow="Témoignages" title="Ce que nos clients disent de nous" />
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((r, i) => (
            <Reveal key={r.id} delay={i * 0.1}>
              <figure className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur transition hover:-translate-y-1 hover:bg-white/10">
                <Quote size={36} className="text-brand-400" />
                <blockquote className="mt-5 flex-1 leading-relaxed text-white/80">“{r.comment}”</blockquote>
                <figcaption className="mt-8 flex items-center justify-between gap-4 border-t border-white/10 pt-6">
                  <div className="flex items-center gap-3">
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-500 font-bold text-white">
                      {r.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                    </span>
                    <div>
                      <p className="font-bold text-white">{r.name}</p>
                      <p className="text-sm text-white/50">{r.role}</p>
                    </div>
                  </div>
                  <Stars value={r.rating} size={14} />
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export function CallToAction() {
  const { t } = useSite()
  return (
    <section className="section">
      <div className="container-x">
        <Reveal className="relative isolate overflow-hidden rounded-[2.5rem] px-6 py-20 text-center text-white sm:px-16">
          <img src={t('cta.image') || undefined} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-900/95 via-brand-800/85 to-brand-700/70" />
          <h2 className="mx-auto max-w-3xl font-display text-4xl font-extrabold md:text-5xl">{t('cta.title')}</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-white/80">{t('cta.text')}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/products" className="btn-accent !px-10 !py-4 text-base hover:scale-105">Commander maintenant</Link>
            <Link to="/contact" className="btn-ghost !px-10 !py-4 text-base">Nous contacter</Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <>
      <Hero />
      <FeatureStrip />
      <Expertise />
      <FeaturedProducts />
      <WhyUs />
      <Testimonials />
      <CallToAction />
    </>
  )
}
