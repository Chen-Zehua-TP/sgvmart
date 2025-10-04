import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cartService } from '../services/cart.service';
import { Cart as CartType } from '../types';
import { authService } from '../services/auth.service';

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authService.getToken()) {
      navigate('/login');
      return;
    }
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const data = await cartService.getCart();
      setCart(data);
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    try {
      await cartService.updateCartItem(itemId, quantity);
      loadCart();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to update cart');
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await cartService.removeFromCart(itemId);
      loadCart();
    } catch (error) {
      alert('Failed to remove item');
    }
  };

  const handleClearCart = async () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      try {
        await cartService.clearCart();
        loadCart();
      } catch (error) {
        alert('Failed to clear cart');
      }
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading cart...</div>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-600 mb-4">Your cart is empty</p>
        <Link to="/products" className="text-blue-600 hover:underline">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        <button
          onClick={handleClearCart}
          className="text-red-600 hover:underline"
        >
          Clear Cart
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        {cart.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 p-4 border-b last:border-b-0"
          >
            <div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
              {item.product.imageUrl ? (
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <span className="text-gray-400 text-xs">No image</span>
              )}
            </div>

            <div className="flex-1">
              <Link
                to={`/products/${item.product.id}`}
                className="font-semibold hover:text-blue-600"
              >
                {item.product.name}
              </Link>
              <p className="text-sm text-gray-600">${item.product.price} each</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max={item.product.stock}
                value={item.quantity}
                onChange={(e) =>
                  handleUpdateQuantity(item.id, parseInt(e.target.value))
                }
                className="border rounded px-2 py-1 w-16"
              />
            </div>

            <div className="text-right w-24">
              <p className="font-bold">
                ${(Number(item.product.price) * item.quantity).toFixed(2)}
              </p>
            </div>

            <button
              onClick={() => handleRemoveItem(item.id)}
              className="text-red-600 hover:text-red-700 px-2"
            >
              ✕
            </button>
          </div>
        ))}

        <div className="p-4 bg-gray-50 rounded-b-lg">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xl font-bold">Total:</span>
            <span className="text-2xl font-bold text-blue-600">
              ${cart.total.toFixed(2)}
            </span>
          </div>

          <div className="flex gap-4">
            <Link
              to="/products"
              className="flex-1 text-center border border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50"
            >
              Continue Shopping
            </Link>
            <Link
              to="/checkout"
              className="flex-1 text-center bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
