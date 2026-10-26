import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, assetUrl } from '../lib/api'

const withImage = (item) => ({ ...item, imageUrl: assetUrl(item.imageUrl) })

const SiteContext = createContext(null)

export function SiteProvider({ children }) {
  const [settings, setSettings] = useState({})
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [services, setServices] = useState([])
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    try {
      const [s, c, p, sv, t] = await Promise.all([
        api.get('/public/settings'),
        api.get('/public/categories'),
        api.get('/public/products'),
        api.get('/public/services'),
        api.get('/public/testimonials'),
      ])
      setSettings(Object.fromEntries(Object.entries(s.data).map(([k, v]) => [k, k.endsWith('.image') ? assetUrl(v) : v])))
      setCategories(c.data)
      setProducts(p.data.map(withImage))
      setServices(sv.data.map(withImage))
      setTestimonials(t.data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  const value = useMemo(
    () => ({
      settings,
      categories,
      products,
      services,
      testimonials,
      loading,
      reload,
      t: (key, fallback = '') => settings[key] ?? fallback,
    }),
    [settings, categories, products, services, testimonials, loading, reload],
  )

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>
}

export const useSite = () => useContext(SiteContext)
