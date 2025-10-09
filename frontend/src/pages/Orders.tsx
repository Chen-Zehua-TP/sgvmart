import { useState, useEffect } from 'react';
import { orderService } from '../services/order.service';
import { authService } from '../services/auth.service';
import { Order } from '../types';

interface GuestOrder {
  id: string;
  email: string;
  productName: string;
  productUrl: string;
  productPrice: number;
  productImageUrl: string;
  quantity: number;
  status: string;
  createdAt: string;
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [guestOrders, setGuestOrders] = useState<GuestOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const isLoggedIn = authService.getToken();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      
      if (isLoggedIn) {
        // Load authenticated user orders
        const data = await orderService.getUserOrders();
        setOrders(data);
      }
      
      // Always load guest orders from localStorage
      const storedGuestOrders = JSON.parse(localStorage.getItem('guestOrders') || '[]');
      setGuestOrders(storedGuestOrders);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading orders...</div>;
  }

  const hasOrders = orders.length > 0 || guestOrders.length > 0;

  if (!hasOrders) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-600 mb-4">You haven't placed any orders yet</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">My Orders</h1>

      <div className="space-y-4">
        {/* Guest Orders */}
        {guestOrders.length > 0 && (
          <>
            <h2 className="text-xl font-semibold text-gray-700 mt-6">Recent Orders</h2>
            {guestOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-blue-600 font-medium mt-1">
                      Email: {order.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 rounded text-sm bg-yellow-100 text-yellow-800">
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="flex gap-4 mb-4">
                  {order.productImageUrl && (
                    <img
                      src={order.productImageUrl}
                      alt={order.productName}
                      className="w-20 h-20 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-2">{order.productName}</p>
                    <p className="text-sm text-gray-600">Quantity: {order.quantity}</p>
                    <a
                      href={order.productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View Product →
                    </a>
                  </div>
                </div>

                <div className="border-t pt-4 flex justify-between items-center">
                  <div>
                    <span className="font-semibold">Total:</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-blue-600">
                      ${(order.productPrice * order.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Order confirmation has been sent to {order.email}. 
                    Our team will process your order shortly.
                  </p>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Authenticated User Orders */}
        {orders.length > 0 && (
          <>
            <h2 className="text-xl font-semibold text-gray-700 mt-6">Account Orders</h2>
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-3 py-1 rounded text-sm ${
                        order.status === 'DELIVERED'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'CANCELLED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.product.name} × {item.quantity}
                      </span>
                      <span>${(Number(item.price) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 flex justify-between items-center">
                  <span className="font-semibold">Total:</span>
                  <span className="text-xl font-bold text-blue-600">
                    ${Number(order.totalAmount).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
