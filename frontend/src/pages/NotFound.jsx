import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="container-x flex min-h-[85vh] flex-col items-center justify-center pt-28 text-center">
      <p className="font-display text-[9rem] leading-none font-black text-brand-500">404</p>
      <h1 className="mt-4 text-3xl font-extrabold">Oups ! Page introuvable</h1>
      <p className="mt-3 max-w-md text-gray-500">La page que vous cherchez a été déplacée ou n’existe plus.</p>
      <Link to="/" className="btn-primary mt-8">Retour à l’accueil</Link>
    </section>
  )
}
