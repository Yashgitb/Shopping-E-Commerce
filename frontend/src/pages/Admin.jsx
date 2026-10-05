import { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContextValue'
import api from '../api'

const tabs = ['Add product', 'Products', 'Orders', 'Users']
const orderStatuses = ['Processing', 'Packed', 'Shipped', 'Delivered', 'Cancelled']
const emptyProduct = {
  name: '',
  description: '',
  price: '',
  category: '',
  subCategory: '',
  sizes: '',
  bestseller: false,
}

const getErrorMessage = (error) => error.response?.data?.message || error.message || 'Request failed'

const Admin = () => {
  const { user, setUser, logout, refreshProducts } = useContext(ShopContext)
  const [tab, setTab] = useState('Add product')
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const [product, setProduct] = useState(emptyProduct)
  const [images, setImages] = useState([])
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
  const [databaseConnected, setDatabaseConnected] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const isAdmin = user?.isAdmin && localStorage.getItem('token')

  useEffect(() => {
    api.get('/api/health')
      .then(({ data }) => setDatabaseConnected(data.databaseConnected))
      .catch(() => setDatabaseConnected(false))
  }, [])

  useEffect(() => {
    if (!isAdmin) return

    Promise.all([
      api.get('/api/product/list'),
      api.post('/api/order/list'),
      api.get('/api/user/list'),
    ])
      .then(([productResponse, orderResponse, userResponse]) => {
        setProducts(productResponse.data.products || [])
        setOrders(orderResponse.data.orders || [])
        setUsers(userResponse.data.users || [])
      })
      .catch((error) => setMessage(getErrorMessage(error)))
      .finally(() => setLoading(false))
  }, [isAdmin])

  const handleLogin = async (event) => {
    event.preventDefault()
    setMessage('')
    setLoading(true)
    try {
      const { data } = await api.post('/api/user/admin', credentials)
      localStorage.setItem('token', data.token)
      setUser(data.user)
    } catch (error) {
      setMessage(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = async (event) => {
    event.preventDefault()
    setMessage('')
    setLoading(true)

    const formData = new FormData()
    Object.entries(product).forEach(([key, value]) => formData.append(key, String(value)))
    formData.set('sizes', JSON.stringify(product.sizes.split(',').map((size) => size.trim()).filter(Boolean)))
    Array.from(images).forEach((image) => formData.append('images', image))

    try {
      const { data } = await api.post('/api/product/add', formData)
      setProducts((current) => [data.product, ...current])
      setProduct(emptyProduct)
      setImages([])
      event.target.reset()
      await refreshProducts()
      setMessage('Product added and saved to the database.')
    } catch (error) {
      setMessage(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveProduct = async (productId) => {
    setMessage('')
    try {
      await api.post('/api/product/remove', { productId })
      setProducts((current) => current.filter((item) => item._id !== productId))
      await refreshProducts()
    } catch (error) {
      setMessage(getErrorMessage(error))
    }
  }

  const handleStatusChange = async (orderId, status) => {
    setMessage('')
    try {
      const { data } = await api.post('/api/order/status', { orderId, status })
      setOrders((current) => current.map((order) => order._id === orderId ? data.order : order))
    } catch (error) {
      setMessage(getErrorMessage(error))
    }
  }

  if (!isAdmin) {
    return (
      <main className="max-w-md mx-auto border-t pt-16 min-h-[60vh]">
        <h1 className="text-2xl font-medium mb-6">Admin login</h1>
        {databaseConnected === false && (
          <p className="mb-4 border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            The backend cannot reach MongoDB. Admin changes will not be available until the database is connected.
          </p>
        )}
        {message && <p role="alert" className="mb-4 text-sm text-red-700">{message}</p>}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            required
            type="email"
            autoComplete="username"
            placeholder="Admin email"
            value={credentials.email}
            onChange={(event) => setCredentials({ ...credentials, email: event.target.value })}
            className="border p-3"
          />
          <input
            required
            type="password"
            autoComplete="current-password"
            placeholder="Password"
            value={credentials.password}
            onChange={(event) => setCredentials({ ...credentials, password: event.target.value })}
            className="border p-3"
          />
          <button disabled={loading} className="bg-black px-6 py-3 text-white disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </main>
    )
  }

  return (
    <main className="border-t pt-10 min-h-[60vh]">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-medium">Admin dashboard</h1>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
        <button
          onClick={() => {
            logout()
            setMessage('')
          }}
          className="border px-4 py-2 text-sm"
        >
          Log out
        </button>
      </div>

      {databaseConnected === false && (
        <p role="alert" className="mb-5 border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          MongoDB is not connected. Database changes are disabled. Check the backend connection and refresh this page.
        </p>
      )}
      {message && <p role="status" className="mb-5 border border-gray-200 bg-gray-50 p-3 text-sm">{message}</p>}

      <nav className="flex flex-wrap gap-2 border-b mb-6" aria-label="Admin sections">
        {tabs.map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={`px-4 py-3 text-sm ${tab === item ? 'border-b-2 border-black font-medium' : 'text-gray-500'}`}
          >
            {item}
          </button>
        ))}
      </nav>

      {loading && <p className="py-4 text-sm text-gray-500">Loading...</p>}

      {tab === 'Add product' && (
        <div className="max-w-3xl pb-10">
          <form onSubmit={handleAddProduct} className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            Product name
            <input required value={product.name} onChange={(event) => setProduct({ ...product, name: event.target.value })} className="border p-2" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Price
            <input required min="0.01" step="0.01" type="number" value={product.price} onChange={(event) => setProduct({ ...product, price: event.target.value })} className="border p-2" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Quantity in stock
            <input required min="0" step="1" type="number" value={product.quantity} onChange={(event) => setProduct({ ...product, quantity: event.target.value })} className="border p-2" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Category
            <input required placeholder="Men, Women, Accessories..." value={product.category} onChange={(event) => setProduct({ ...product, category: event.target.value })} className="border p-2" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Subcategory
            <input value={product.subCategory} onChange={(event) => setProduct({ ...product, subCategory: event.target.value })} className="border p-2" />
          </label>
          <label className="flex flex-col gap-1 text-sm md:col-span-2">
            Description
            <textarea required rows="3" value={product.description} onChange={(event) => setProduct({ ...product, description: event.target.value })} className="border p-2" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Sizes (comma separated)
            <input required placeholder="S, M, L, XL" value={product.sizes} onChange={(event) => setProduct({ ...product, sizes: event.target.value })} className="border p-2" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Product images (up to 4; combined maximum 10 MB)
            <input type="file" accept="image/*" multiple onChange={(event) => setImages(event.target.files)} className="border p-2" />
          </label>
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input type="checkbox" checked={product.bestseller} onChange={(event) => setProduct({ ...product, bestseller: event.target.checked })} />
            Mark as bestseller
          </label>
          <button disabled={loading || databaseConnected === false} className="bg-black px-6 py-3 text-white disabled:opacity-50 md:col-span-2">
            {loading ? 'Saving...' : 'Add product'}
          </button>
          </form>
        </div>
      )}

      {tab === 'Products' && (
        <div className="overflow-x-auto pb-10">
          <table className="w-full min-w-150 text-left text-sm">
            <thead><tr className="border-b"><th className="p-3">Product</th><th className="p-3">Category</th><th className="p-3">Price</th><th className="p-3">Quantity</th><th className="p-3">Sizes</th><th className="p-3" /></tr></thead>
            <tbody>
              {products.map((item) => (
                <tr key={item._id} className="border-b">
                  <td className="p-3">{item.name}</td><td className="p-3">{item.category}</td><td className="p-3">{item.price}</td><td className="p-3">{item.quantity ?? '—'}</td><td className="p-3">{item.sizes?.join(', ')}</td>
                  <td className="p-3 text-right"><button disabled={databaseConnected === false} onClick={() => handleRemoveProduct(item._id)} className="text-red-700 disabled:opacity-50">Remove</button></td>
                </tr>
              ))}
              {!products.length && <tr><td colSpan="6" className="p-4 text-gray-500">No products found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'Orders' && (
        <div className="overflow-x-auto pb-10">
          <table className="w-full min-w-175 text-left text-sm">
            <thead><tr className="border-b"><th className="p-3">Order</th><th className="p-3">Customer ID</th><th className="p-3">Items</th><th className="p-3">Amount</th><th className="p-3">Status</th></tr></thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-b">
                  <td className="p-3">{order._id}</td><td className="p-3">{order.userId}</td>
                  <td className="p-3">{order.items?.map((item) => `${item.name} × ${item.quantity}`).join(', ')}</td>
                  <td className="p-3">{order.amount}</td>
                  <td className="p-3">
                    <select value={order.status} onChange={(event) => handleStatusChange(order._id, event.target.value)} className="border p-2" disabled={databaseConnected === false}>
                      {orderStatuses.map((status) => <option key={status}>{status}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
              {!orders.length && <tr><td colSpan="5" className="p-4 text-gray-500">No orders found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'Users' && (
        <div className="overflow-x-auto pb-10">
          <table className="w-full min-w-125 text-left text-sm">
            <thead><tr className="border-b"><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3">Joined</th></tr></thead>
            <tbody>
              {users.map((item) => (
                <tr key={item._id} className="border-b">
                  <td className="p-3">{item.name}</td><td className="p-3">{item.email}</td><td className="p-3">{item.isAdmin ? 'Admin' : 'Customer'}</td><td className="p-3">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
              {!users.length && <tr><td colSpan="4" className="p-4 text-gray-500">No users found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}

export default Admin
