import { useState } from 'react'
import toast from 'react-hot-toast'
import { Clock, Mail, MapPin, Phone, Send } from 'lucide-react'
import { PageHeader, Reveal, Spinner } from '../components/ui'
import { SocialLinks } from '../components/Footer'
import { useSite } from '../context/SiteContext'
import { api, errorMessage } from '../lib/api'

const EMPTY = { name: '', email: '', phone: '', subject: '', message: '' }

export default function Contact() {
  const { t } = useSite()
  const [form, setForm] = useState(EMPTY)
  const [sending, setSending] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setSending(true)
    try {
      const { data } = await api.post('/public/contact', form)
      toast.success(data.message)
      setForm(EMPTY)
    } catch (err) {
      toast.error(errorMessage(err, 'Impossible d’envoyer le message'))
    } finally {
      setSending(false)
    }
  }

  const infos = [
    { icon: Phone, label: 'Téléphone', value: t('contact.phone'), href: `tel:${t('contact.phone').replace(/\s/g, '')}` },
    { icon: Mail, label: 'Email', value: t('contact.email'), href: `mailto:${t('contact.email')}` },
    { icon: MapPin, label: 'Adresse', value: t('contact.address') },
    { icon: Clock, label: 'Horaires', value: t('contact.hours') },
  ]

  return (
    <>
      <PageHeader
        title="Contactez-nous"
        text="Une question, une commande professionnelle ou un besoin particulier ? Notre équipe vous répond rapidement."
        crumb="Contact"
        image="https://images.unsplash.com/photo-1601599561213-832382fd07ba?auto=format&fit=crop&w=1600&q=70"
      />

      <section className="section">
        <div className="container-x grid gap-10 lg:grid-cols-5">
          <Reveal className="space-y-4 lg:col-span-2">
            <h2 className="text-2xl font-bold">Informations de contact</h2>
            <p className="text-gray-500">Passez nous voir, appelez-nous ou écrivez-nous : nous sommes à votre écoute.</p>
            {infos.map(({ icon: Icon, label, value, href }) => {
              const Comp = href ? 'a' : 'div'
              return (
                <Comp key={label} href={href} className="group flex items-center gap-4 rounded-2xl border border-gray-100 p-5 transition hover:border-brand-200 hover:bg-brand-50/50">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-500 text-white shadow-lg shadow-brand-500/25 transition group-hover:scale-110">
                    <Icon size={20} />
                  </span>
                  <div>
                    <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase">{label}</p>
                    <p className="font-semibold">{value}</p>
                  </div>
                </Comp>
              )
            })}
            <div className="pt-4">
              <p className="mb-3 font-bold">Suivez-nous</p>
              <SocialLinks dark={false} />
            </div>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-3">
            <form onSubmit={submit} className="card p-6 sm:p-10">
              <h2 className="text-2xl font-bold">Envoyez-nous un message</h2>
              <p className="mt-1 mb-8 text-gray-500">Réponse sous 24h ouvrées.</p>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="label">Nom complet *</label>
                  <input required value={form.name} onChange={set('name')} className="input" placeholder="Votre nom" />
                </div>
                <div>
                  <label className="label">Email *</label>
                  <input required type="email" value={form.email} onChange={set('email')} className="input" placeholder="votre@email.com" />
                </div>
                <div>
                  <label className="label">Téléphone</label>
                  <input value={form.phone} onChange={set('phone')} className="input" placeholder="+228 XX XX XX XX" />
                </div>
                <div>
                  <label className="label">Sujet</label>
                  <input value={form.subject} onChange={set('subject')} className="input" placeholder="Sujet de votre message" />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Message *</label>
                  <textarea required rows={6} value={form.message} onChange={set('message')} className="input resize-none" placeholder="Comment pouvons-nous vous aider ?" />
                </div>
              </div>
              <button disabled={sending} className="btn-primary mt-8 w-full !py-4 sm:w-auto sm:!px-10">
                {sending ? <Spinner className="h-5 w-5" /> : <Send size={18} />} Envoyer le message
              </button>
            </form>
          </Reveal>
        </div>
      </section>

      <section className="pb-20">
        <div className="container-x">
          <div className="overflow-hidden rounded-[2.5rem] border border-gray-100 shadow-lg">
            <iframe
              title="Localisation DABA"
              src={`https://www.google.com/maps?q=${encodeURIComponent(t('contact.mapQuery', 'Lomé, Togo'))}&output=embed`}
              className="h-[420px] w-full grayscale-[30%]"
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </>
  )
}
