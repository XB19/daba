import { lazy, Suspense, useEffect } from 'react'
import { Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { motion } from 'framer-motion'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { SocialIcons, Spinner } from './components/ui'
import { useSite } from './context/SiteContext'
import Home from './pages/Home'
import About from './pages/About'
import Products from './pages/Products'
import Services from './pages/Services'
import Contact from './pages/Contact'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import Login from './pages/Login'
import Account from './pages/Account'
import NotFound from './pages/NotFound'

const AdminLayout = lazy(() => import('./admin/AdminLayout'))
const AdminLogin = lazy(() => import('./admin/AdminLogin'))
const Dashboard = lazy(() => import('./admin/Dashboard'))
const AdminOrders = lazy(() => import('./admin/Orders'))
const AdminProducts = lazy(() => import('./admin/Products'))
const AdminCategories = lazy(() => import('./admin/Categories'))
const AdminServices = lazy(() => import('./admin/Services'))
const AdminTestimonials = lazy(() => import('./admin/Testimonials'))
const AdminMessages = lazy(() => import('./admin/Messages'))
const AdminSubscribers = lazy(() => import('./admin/Subscribers'))
const AdminUsers = lazy(() => import('./admin/Users'))
const AdminSettings = lazy(() => import('./admin/Settings'))

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

function WhatsAppButton() {
  const { t } = useSite()
  const href = t('social.whatsapp')
  if (!href) return null
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noreferrer"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 1 }}
      className="fixed right-5 bottom-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25d366] text-white shadow-xl shadow-black/20 transition hover:scale-110"
      aria-label="WhatsApp"
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-[#25d366] opacity-30" />
      <SocialIcons.whatsapp width="26" height="26" />
    </motion.a>
  )
}

function PublicLayout() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Toaster position="top-center" toastOptions={{ style: { borderRadius: '14px', fontWeight: 600, fontSize: '14px' } }} />
      <Suspense fallback={<div className="grid min-h-screen place-items-center"><Spinner className="h-8 w-8 text-brand-500" /></div>}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="products" element={<Products />} />
          <Route path="services" element={<Services />} />
          <Route path="contact" element={<Contact />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order/:reference" element={<OrderSuccess />} />
          <Route path="account" element={<Account />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="login" element={<><Navbar /><Login /></>} />
        <Route path="admin/login" element={<AdminLogin />} />
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="testimonials" element={<AdminTestimonials />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="subscribers" element={<AdminSubscribers />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
      </Suspense>
    </>
  )
}
