/**
 * Example: Guest Checkout Component
 * 
 * Complete implementation showing:
 * - Guest order creation
 * - Form validation
 * - Error handling
 * - localStorage integration
 */

import React, { useState } from 'react';
import { orderService } from '../services/order.service';
import { useNavigate } from 'react-router-dom';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface GuestInfo {
  email: string;
  name: string;
  phone: string;
  address: string;
}

export const GuestCheckoutExample: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Example cart items (in real app, get from cart service)
  const cartItems: CartItem[] = [
    { id: 'prod_1', name: 'Product A', price: 29.99, quantity: 2 },
    { id: 'prod_2', name: 'Product B', price: 19.99, quantity: 1 },
  ];
  
  const [guestInfo, setGuestInfo] = useState<GuestInfo>({
    email: '',
    name: '',
    phone: '',
    address: '',
  });

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setGuestInfo((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    if (!guestInfo.email || !guestInfo.email.includes('@')) {
      setError('Valid email is required');
      return false;
    }
    
    if (!guestInfo.name || guestInfo.name.length < 2) {
      setError('Name must be at least 2 characters');
      return false;
    }
    
    if (!guestInfo.address || guestInfo.address.length < 5) {
      setError('Valid address is required');
      return false;
    }
    
    return true;
  };

  const handleGuestCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Create guest order
      const order = await orderService.createGuestOrder({
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
          productName: item.name,
        })),
        totalAmount: calculateTotal(),
        paymentMethod: 'Credit Card', // In production, use payment processor
        guestEmail: guestInfo.email,
        guestName: guestInfo.name,
        guestPhone: guestInfo.phone,
        guestAddress: guestInfo.address,
      });
      
      console.log('Order created successfully:', order);
      
      // Navigate to confirmation page
      navigate(`/order-confirmation/${order.id}`);
      
    } catch (err: any) {
      console.error('Checkout failed:', err);
      setError(err.response?.data?.error || 'Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Guest Checkout</h1>
      
      {/* Cart Summary */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        {cartItems.map((item) => (
          <div key={item.id} className="flex justify-between mb-2">
            <span>
              {item.name} x {item.quantity}
            </span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between font-bold">
            <span>Total:</span>
            <span>${calculateTotal().toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      {/* Guest Info Form */}
      <form onSubmit={handleGuestCheckout} className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Email *</label>
          <input
            type="email"
            name="email"
            value={guestInfo.email}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="your@email.com"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Full Name *</label>
          <input
            type="text"
            name="name"
            value={guestInfo.name}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="John Doe"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Phone</label>
          <input
            type="tel"
            name="phone"
            value={guestInfo.phone}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="+1 (555) 123-4567"
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Shipping Address *</label>
          <textarea
            name="address"
            value={guestInfo.address}
            onChange={handleInputChange}
            required
            rows={3}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="123 Main St, Apt 4B, New York, NY 10001"
          />
        </div>
        
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4">
          <p className="text-sm">
            💡 <strong>Tip:</strong> Create an account to track your orders and checkout faster next time!
          </p>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          {loading ? 'Processing...' : 'Place Order'}
        </button>
      </form>
    </div>
  );
};
