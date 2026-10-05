import { useContext } from 'react'
import { ShopContext } from '../context/ShopContextValue'
import Title from '../components/Title'

const Orders = () => {
  const { currency, orders } = useContext(ShopContext)
  const items = orders.flatMap((order) =>
    order.items.map((item) => ({
      ...item,
      orderDate: order.date,
      status: item.status || order.status,
    }))
  )

  return (
    <div className="border-t pt-16">
      <div className="text-2xl">
        <Title text1="MY" text2="ORDERS" />
      </div>
      <div>
        {items.length === 0 ? (
          <p className="text-gray-500 py-8">You have no orders yet.</p>
        ) : (
          items.map((item, index) => (
            <div
              key={index}
              className="py-4 border-t border-b text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <div className="flex items-start gap-6 text-sm">
                <img className="w-16 sm:w-20" src={Array.isArray(item.image) ? item.image[0] : item.image} alt={item.name} />
                <div>
                  <p className="sm:text-base font-medium">{item.name}</p>
                  <div className="flex items-center gap-3 mt-1 text-base text-gray-700">
                    <p>
                      {currency}
                      {item.price}
                    </p>
                    <p>Quantity: {item.quantity}</p>
                    <p>Size: {item.size}</p>
                  </div>
                  <p className="mt-1">
                    Date: <span className="text-gray-400">{item.orderDate ? new Date(item.orderDate).toDateString() : '—'}</span>
                  </p>
                </div>
              </div>
              <div className="md:w-1/2 flex justify-between">
                <div className="flex items-center gap-2">
                  <p className="min-w-2 h-2 rounded-full bg-green-500" />
                  <p className="text-sm md:text-base">{item.status || 'Processing'}</p>
                </div>
                <button className="border px-4 py-2 text-sm font-medium rounded-sm">Track Order</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Orders
