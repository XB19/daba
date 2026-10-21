import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Award, Bird, ChevronRight, Factory, Flame, HeartHandshake, Leaf, LoaderCircle, Package, ShieldCheck, Snowflake, Sparkles, Sprout, Star, Store, Truck,
} from 'lucide-react'

/** Icônes disponibles pour les services (choisies dans l'administration). */
export const SERVICE_ICONS = { Bird, Factory, ShieldCheck, Truck, Sprout, Leaf, Snowflake, Store, Award, HeartHandshake, Flame, Package }

/** Apparition douce au défilement. */
export function Reveal({ children, delay = 0, y = 30, x = 0, className = '', as = 'div' }) {
  const Comp = motion[as]
  return (
    <Comp
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </Comp>
  )
}

export function SectionHeading({ eyebrow, title, text, align = 'center', light = false }) {
  const centered = align === 'center'
  return (
    <Reveal className={`mb-14 max-w-2xl ${centered ? 'mx-auto text-center' : ''}`}>
      {eyebrow && <span className={`eyebrow ${light ? 'bg-white/10 text-brand-200' : ''}`}>{eyebrow}</span>}
      <h2 className={`title-xl mt-4 ${light ? 'text-white' : ''}`}>{title}</h2>
      {text && <p className={`mt-4 text-lg leading-relaxed ${light ? 'text-white/70' : 'text-gray-500'}`}>{text}</p>}
    </Reveal>
  )
}

/** Bandeau d'en-tête des pages intérieures. */
export function PageHeader({ title, text, image, crumb }) {
  return (
    <section className="relative isolate overflow-hidden bg-brand-950 pt-40 pb-24 text-white">
      {image && (
        <img src={image} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-30" />
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-950 via-brand-950/90 to-brand-800/60" />
      <div className="absolute -top-24 -right-24 -z-10 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" />
      <div className="container-x">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <nav className="mb-5 flex items-center gap-1.5 text-sm text-white/60">
            <Link to="/" className="hover:text-white">Accueil</Link>
            <ChevronRight size={14} />
            <span className="text-brand-300">{crumb || title}</span>
          </nav>
          <h1 className="font-display text-4xl font-extrabold tracking-tight md:text-6xl">{title}</h1>
          {text && <p className="mt-5 max-w-2xl text-lg text-white/75">{text}</p>}
        </motion.div>
      </div>
    </section>
  )
}

export function DynamicIcon({ name, ...props }) {
  const Icon = SERVICE_ICONS[name] || Sparkles
  return <Icon {...props} />
}

export function Stars({ value = 5, size = 16 }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} className={i <= value ? 'fill-sun-400 text-sun-400' : 'text-gray-200'} />
      ))}
    </div>
  )
}

export function Spinner({ className = '' }) {
  return <LoaderCircle className={`animate-spin ${className}`} />
}

/* Icônes de réseaux sociaux (formes simplifiées). */
export const SocialIcons = {
  facebook: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" {...p}>
      <path d="M14 8h3V4h-3c-2.8 0-4.5 1.8-4.5 4.6V11H7v4h2.5v9h4v-9h3l.5-4h-3.5V8.8c0-.5.3-.8.5-.8Z" />
    </svg>
  ),
  instagram: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" {...p}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  ),
  linkedin: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" {...p}>
      <path d="M4 9h3.6v11H4V9Zm1.8-5.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM10 9h3.4v1.6c.5-.9 1.7-1.9 3.5-1.9 3.7 0 4.4 2.4 4.4 5.6V20h-3.6v-5c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V20H10V9Z" />
    </svg>
  ),
  whatsapp: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" {...p}>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.5-.3Z" />
    </svg>
  ),
}
