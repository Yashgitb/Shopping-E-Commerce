import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { toast } from 'react-toastify'
import { products as dummyProducts } from '../assets/assets'

const getCartCountFrom = (cartItems) => {
  let totalCount = 0
  for (const itemId in cartItems) {
    for (const size in cartItems[itemId]) {
      if (cartItems[itemId][size] > 0) {
        totalCount += cartItems[itemId][size]
      }
    }
  }
  return totalCount
}

const getCartAmountFrom = (cartItems, products) => {
  let totalAmount = 0
  for (const itemId in cartItems) {
    const product = products.find((p) => p._id === itemId)
    if (!product) continue
    for (const size in cartItems[itemId]) {
      if (cartItems[itemId][size] > 0) {
        totalAmount += product.price * cartItems[itemId][size]
      }
    }
  }
  return totalAmount
}

const useShopStore = create(
  persist(
    (set, get) => ({
      products: dummyProducts,
      currency: '$',
      delivery_fee: 10,
      search: '',
      showSearch: false,
      cartItems: {},
      orders: [],

      setSearch: (search) => set({ search }),
      setShowSearch: (showSearch) => set({ showSearch }),

      addToCart: (itemId, size) => {
        if (!size) {
          toast.error('Select Product Size')
          return
        }

        const cartData = structuredClone(get().cartItems)
        if (cartData[itemId]) {
          if (cartData[itemId][size]) {
            cartData[itemId][size] += 1
          } else {
            cartData[itemId][size] = 1
          }
        } else {
          cartData[itemId] = { [size]: 1 }
        }
        set({ cartItems: cartData })
        toast.success('Added to cart')
      },

      getCartCount: () => getCartCountFrom(get().cartItems),

      updateQuantity: (itemId, size, quantity) => {
        const cartData = structuredClone(get().cartItems)
        cartData[itemId][size] = quantity
        set({ cartItems: cartData })
      },

      getCartAmount: () => getCartAmountFrom(get().cartItems, get().products),

      placeOrder: (address, paymentMethod) => {
        const { cartItems, products, delivery_fee } = get()
        const items = []
        for (const itemId in cartItems) {
          const product = products.find((p) => p._id === itemId)
          if (!product) continue
          for (const size in cartItems[itemId]) {
            if (cartItems[itemId][size] > 0) {
              items.push({
                ...product,
                size,
                quantity: cartItems[itemId][size],
                status: 'Ready to ship',
              })
            }
          }
        }

        if (items.length === 0) {
          toast.error('Your cart is empty')
          return false
        }

        const amount = getCartAmountFrom(cartItems, products) + delivery_fee
        set({
          orders: [{ items, amount, address, paymentMethod, date: Date.now() }, ...get().orders],
          cartItems: {},
        })
        toast.success('Order placed')
        return true
      },
    }),
    {
      name: 'forever-shop',
      partialize: (state) => ({
        cartItems: state.cartItems,
        orders: state.orders,
      }),
    }
  )
)

export default useShopStore
