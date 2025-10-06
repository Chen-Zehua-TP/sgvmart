import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cartService } from '../services/cart.service';
import { Cart as CartType } from '../types';
import { authService } from '../services/auth.service';

interface GuestCartItem {
  id: string;
  productName: string;
  productUrl: string;
  productPrice: number;
  productImageUrl: string;
  quantity: number;
}

export default function Cart() {
  const [cart, setCart] = useState<CartType | null>(null);
  const [guestCart, setGuestCart] = useState<GuestCartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const isLoggedIn = authService.getToken();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      
      if (isLoggedIn) {
        const data = await cartService.getCart();
        setCart(data);
      }
      
      // Always load guest cart
      const storedGuestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
      setGuestCart(storedGuestCart);
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    if (isLoggedIn) {
      try {
        await cartService.updateCartItem(itemId, quantity);
        loadCart();
      } catch (error: any) {
        alert(error.response?.data?.error || 'Failed to update cart');
      }
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (isLoggedIn) {
      try {
        await cartService.removeFromCart(itemId);
        loadCart();
      } catch (error) {
        alert('Failed to remove item');
      }
    }
  };

  const handleUpdateGuestQuantity = (itemId: string, quantity: number) => {
    const updatedCart = guestCart.map(item =>
      item.id === itemId ? { ...item, quantity: Math.max(1, quantity) } : item
    );
    setGuestCart(updatedCart);
    localStorage.setItem('guestCart', JSON.stringify(updatedCart));
  };

  const handleRemoveGuestItem = (itemId: string) => {
    const updatedCart = guestCart.filter(item => item.id !== itemId);
    setGuestCart(updatedCart);
    localStorage.setItem('guestCart', JSON.stringify(updatedCart));
  };

  const handleClearCart = async () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      if (isLoggedIn) {
        try {
          await cartService.clearCart();
          loadCart();
        } catch (error) {
          alert('Failed to clear cart');
        }
      }
      setGuestCart([]);
      localStorage.setItem('guestCart', '[]');
    }
  };

  const handleCheckoutGuest = () => {
    // Calculate discounted price and create orders directly
    const guestOrders = JSON.parse(localStorage.getItem('guestOrders') || '[]');
    
    guestCart.forEach(item => {
      const discountedPrice = item.productPrice * 0.9;
      const newOrder = {
        id: Date.now().toString() + Math.random(),
        email: 'guest@order.com',
        productName: item.productName,
        productUrl: item.productUrl,
        productPrice: discountedPrice,
        originalPrice: item.productPrice,
        productImageUrl: item.productImageUrl,
        quantity: item.quantity,
        discount: '10%',
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      };
      guestOrders.push(newOrder);
    });

    localStorage.setItem('guestOrders', JSON.stringify(guestOrders));
    localStorage.setItem('guestCart', '[]');
    setGuestCart([]);
    alert(`Orders placed successfully! You saved ${(guestTotal - guestDiscountedTotal).toFixed(2)} with 10% discount.`);
  };

  const guestTotal = guestCart.reduce((sum, item) => sum + (item.productPrice * item.quantity), 0);
  const guestDiscountedTotal = guestTotal * 0.9;

  if (loading) {
    return <div className="text-center py-8">Loading cart...</div>;
  }

  const hasItems = (cart && cart.items.length > 0) || guestCart.length > 0;

  if (!hasItems) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-600 mb-4">Your cart is empty</p>
        <Link to="/" className="text-blue-600 hover:underline">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-blue-900">Shopping Cart</h1>
        <button
          onClick={handleClearCart}
          className="text-red-600 hover:underline"
        >
          Clear Cart
        </button>
      </div>

      {/* Guest Cart Items */}
      {guestCart.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 bg-blue-50 border-b">
            <h2 className="font-semibold text-blue-900">Guest Cart Items</h2>
          </div>
          
          {guestCart.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-4 border-b last:border-b-0"
            >
              <div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                {item.productImageUrl ? (
                  <img
                    src={item.productImageUrl}
                    alt={item.productName}
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <span className="text-gray-400 text-xs">No image</span>
                )}
              </div>

              <div className="flex-1">
                <a
                  href={item.productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-gray-900 hover:text-blue-600"
                >
                  {item.productName}
                </a>
                <p className="text-sm text-gray-600">${item.productPrice.toFixed(2)} each</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    handleUpdateGuestQuantity(item.id, parseInt(e.target.value))
                  }
                  className="border border-gray-300 rounded px-2 py-1 w-16 text-gray-900"
                />
              </div>

              <div className="text-right w-24">
                <p className="font-bold text-gray-900">
                  ${(item.productPrice * item.quantity).toFixed(2)}
                </p>
              </div>

              <button
                onClick={() => handleRemoveGuestItem(item.id)}
                className="text-red-600 hover:text-red-700 px-2"
              >
                ✕
              </button>
            </div>
          ))}

          <div className="p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg text-gray-900">Subtotal:</span>
              <span className="text-lg line-through text-gray-500">
                ${guestTotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xl font-bold text-gray-900">Total with 10% OFF:</span>
              <span className="text-2xl font-bold text-green-600">
                ${guestDiscountedTotal.toFixed(2)}
              </span>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-green-800 font-medium">
                🎉 You'll save ${(guestTotal - guestDiscountedTotal).toFixed(2)} at checkout!
              </p>
            </div>

            <div className="flex gap-4">
              <Link
                to="/"
                className="flex-1 text-center border border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50"
              >
                Continue Shopping
              </Link>
              <button
                onClick={handleCheckoutGuest}
                className="flex-1 text-center bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700"
              >
                Checkout with 10% Off
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Authenticated User Cart Items */}
      {cart && cart.items.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 bg-blue-50 border-b">
            <h2 className="font-semibold text-blue-900">Account Cart Items</h2>
          </div>

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
                  className="font-semibold text-gray-900 hover:text-blue-600"
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
                  className="border border-gray-300 rounded px-2 py-1 w-16 text-gray-900"
                />
              </div>

              <div className="text-right w-24">
                <p className="font-bold text-gray-900">
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
              <span className="text-xl font-bold text-gray-900">Total:</span>
              <span className="text-2xl font-bold text-blue-600">
                ${cart.total.toFixed(2)}
              </span>
            </div>

            <div className="flex gap-4">
              <Link
                to="/"
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
      )}
    </div>
  );
}
