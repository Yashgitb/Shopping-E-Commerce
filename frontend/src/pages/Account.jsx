import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { ShopContext } from '../context/ShopContextValue'
import Title from '../components/Title'

const Account = () => {
  const { user, orders, currency } = useContext(ShopContext)

  if (!user) {
    return (
      <div className="border-t pt-16 text-center">
        <div className="text-2xl mb-6">
          <Title text1="MY" text2="ACCOUNT" />
        </div>
        <p className="text-gray-600">Please log in to view your account details and orders.</p>
        <Link to="/login" className="inline-block mt-6 bg-black text-white px-8 py-3 text-sm">
          LOGIN
        </Link>
      </div>
    )
  }

  return (
    <div className="border-t pt-16">
      <div className="text-2xl">
        <Title text1="MY" text2="ACCOUNT" />
      </div>

      <div className="mt-8 rounded border border-gray-200 bg-gray-50 p-6">
        <p className="text-sm text-gray-500">Welcome back</p>
        <h2 className="mt-2 text-3xl font-medium text-gray-800">{user.name}</h2>
        <p className="mt-2 text-gray-600">{user.email}</p>
      </div>

      <div className="mt-12">
        <div className="text-xl mb-6">
          <Title text1="MY" text2="ORDERS" />
        </div>

        {orders.length === 0 ? (
          <p className="text-gray-500 py-4">You have not placed any orders yet.</p>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => (
              <div key={`${order.date || index}-${index}`} className="border border-gray-200 rounded-lg p-5">
                <div className="flex flex-col sm:flex-row justify-between gap-3 border-b pb-3 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Order #{index + 1}</p>
                    <p className="font-medium text-gray-800">{order.date ? new Date(order.date).toDateString() : '—'}</p>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>
                      Total: <span className="font-medium text-gray-800">{currency}{order.amount}</span>
                    </p>
                    <p>Payment: {order.paymentMethod || 'COD'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {order.items.map((item, itemIndex) => (
                    <div key={`${item.name}-${itemIndex}`} className="flex items-start gap-4 border-b last:border-b-0 pb-4 last:pb-0">
                      <img src={item.image?.[0] || item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{item.name}</p>
                        <div className="mt-1 flex flex-wrap gap-3 text-sm text-gray-600">
                          <span>Qty: {item.quantity}</span>
                          <span>Size: {item.size}</span>
                          <span>{currency}{item.price}</span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">Status: {item.status || order.status || 'Processing'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Account
