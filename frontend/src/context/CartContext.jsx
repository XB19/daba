import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

const CART_KEY = 'daba_cart'
const CartContext = createContext(null)

const readCart = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart)

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items))
    } catch {
      /* stockage indisponible */
    }
  }, [items])

  const add = (product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id)
      if (existing) {
        return prev.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i))
      }
      return [
        ...prev,
        { id: product.id, name: product.name, price: product.price, unit: product.unit, imageUrl: product.imageUrl, quantity },
      ]
    })
    toast.success(`${product.name} ajouté au panier`)
  }

  const update = (id, quantity) =>
    setItems((prev) => (quantity <= 0 ? prev.filter((i) => i.id !== id) : prev.map((i) => (i.id === id ? { ...i, quantity } : i))))

  const remove = (id) => setItems((prev) => prev.filter((i) => i.id !== id))
  const clear = () => setItems([])

  const value = useMemo(() => {
    const count = items.reduce((s, i) => s + i.quantity, 0)
    const subtotal = items.reduce((s, i) => s + i.quantity * i.price, 0)
    return { items, add, update, remove, clear, count, subtotal }
  }, [items])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => useContext(CartContext)
