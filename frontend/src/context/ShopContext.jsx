import { useEffect, useState } from 'react'
import { products as dummyProducts } from '../assets/assets'
import { toast } from 'react-toastify'
import api from '../api'
import { ShopContext } from './ShopContextValue'

const getStoredUser = () => {
  if (!localStorage.getItem('token')) return null

  try {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

const getStoredCart = () => {
  try {
    const stored = localStorage.getItem('cartItems')
    return stored ? JSON.parse(stored) : {}
  } catch {
    localStorage.removeItem('cartItems')
    return {}
  }
}

const getErrorMessage = (error) => error.response?.data?.message || error.message || 'Request failed'

const ShopContextProvider = ({ children }) => {
  const currency = '$'
  const delivery_fee = 10
  const [products, setProducts] = useState(dummyProducts)
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [cartItems, setCartItems] = useState(getStoredCart)
  const [orders, setOrders] = useState([])
  const [user, setUser] = useState(getStoredUser)

  useEffect(() => {
    api.get('/api/product/list')
      .then(({ data }) => setProducts(data.products))
      .catch(() => {})
  }, [])

  const refreshProducts = async () => {
    const { data } = await api.get('/api/product/list')
    setProducts(data.products)
  }

  useEffect(() => {
    if (!user || !localStorage.getItem('token')) {
      return
    }

    Promise.all([api.post('/api/cart/get'), api.get('/api/order/userorders')])
      .then(([cartResponse, ordersResponse]) => {
        setCartItems(cartResponse.data.cartData || {})
        setOrders(ordersResponse.data.orders || [])
      })
      .catch((error) => toast.error(getErrorMessage(error)))
  }, [user])

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems))
  }, [cartItems])

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }
  }, [user])

  const authenticate = async (path, payload) => {
    try {
      const { data } = await api.post(path, payload)
      localStorage.setItem('token', data.token)
      setUser(data.user)
      setCartItems(data.user.cartData || {})
      return true
    } catch (error) {
      toast.error(getErrorMessage(error))
      return false
    }
  }

  const login = (email, password) => authenticate('/api/user/login', { email, password })
  const register = (name, email, password) => authenticate('/api/user/register', { name, email, password })

  const addToCart = (itemId, size) => {
    if (!size) {
      toast.error('Select Product Size')
      return
    }

    setCartItems((current) => {
      const cartData = structuredClone(current)
      cartData[itemId] = cartData[itemId] || {}
      cartData[itemId][size] = (cartData[itemId][size] || 0) + 1
      return cartData
    })

    if (user && localStorage.getItem('token')) {
      api.post('/api/cart/add', { productId: itemId, size, quantity: 1 })
        .catch((error) => toast.error(getErrorMessage(error)))
    }
    toast.success('Added to cart')
  }

  const getCartCount = () => {
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

  const updateQuantity = (itemId, size, quantity) => {
    setCartItems((current) => {
      const cartData = structuredClone(current)
      if (!cartData[itemId]) return cartData
      cartData[itemId][size] = quantity
      return cartData
    })

    if (user && localStorage.getItem('token')) {
      api.post('/api/cart/update', { productId: itemId, size, quantity })
        .catch((error) => toast.error(getErrorMessage(error)))
    }
  }

  const getCartAmount = () => {
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

  const placeOrder = async (address, paymentMethod) => {
    if (!user || !localStorage.getItem('token')) {
      toast.error('Please log in before placing your order')
      return false
    }

    if (getCartCount() === 0) {
      toast.error('Your cart is empty')
      return false
    }

    try {
      const { data } = await api.post('/api/order/place', { address, paymentMethod })
      setOrders((current) => [data.order, ...current])
      setCartItems({})
      toast.success('Order placed')
      return true
    } catch (error) {
      toast.error(getErrorMessage(error))
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setCartItems({})
    setOrders([])
    toast.info('Logged out successfully')
  }

  const value = {
    products,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    addToCart,
    getCartCount,
    updateQuantity,
    getCartAmount,
    orders,
    placeOrder,
    user,
    setUser,
    login,
    register,
    refreshProducts,
    logout,
  }

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}

export default ShopContextProvider
