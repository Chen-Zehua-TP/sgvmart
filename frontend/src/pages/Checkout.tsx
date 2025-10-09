import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartService } from '../services/cart.service';
import { orderService } from '../services/order.service';
import { authService } from '../services/auth.service';
import api from '../services/api';
import { Cart, Address } from '../types';

export default function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<Cart | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('cash');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    isDefault: false,
  });

  const isLoggedIn = authService.getToken();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    loadCheckoutData();
  }, [isLoggedIn, navigate]);

  const loadCheckoutData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load cart
      const cartData = await cartService.getCart();
      if (!cartData || cartData.items.length === 0) {
        setError('Your cart is empty');
        setLoading(false);
        return;
      }
      setCart(cartData);

      // Load addresses
      const addressesData = await api.get('/users/addresses');
      setAddresses(addressesData.data.addresses);

      // Select default address or first address
      const defaultAddress = addressesData.data.addresses.find((addr: Address) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      } else if (addressesData.data.addresses.length > 0) {
        setSelectedAddressId(addressesData.data.addresses[0].id);
      }

      setLoading(false);
    } catch (err: any) {
      console.error('Failed to load checkout data:', err);
      setError(err.response?.data?.error || 'Failed to load checkout data');
      setLoading(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/users/addresses', newAddress);
      setShowNewAddressForm(false);
      setNewAddress({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA',
        isDefault: false,
      });
      loadCheckoutData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to add address');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setError('Please select a shipping address');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      // Create order with selected payment method
      await orderService.createOrder(
        selectedAddressId,
        selectedPaymentMethod
      );

      // Clear cart and redirect to orders page
      await cartService.clearCart();
      navigate('/orders');
    } catch (err: any) {
      console.error('Order creation failed:', err);
      setError(err.response?.data?.error || 'Failed to create order');
      setProcessing(false);
    }
  };

  if (!isLoggedIn) {
    return null;
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">Loading checkout...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
        <button
          onClick={() => navigate('/cart')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Back to Cart
        </button>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800">Your cart is empty</p>
        </div>
        <button
          onClick={() => navigate('/products')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Shipping & Payment */}
        <div className="lg:col-span-2">
          {/* Shipping Address Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>

            {addresses.length === 0 ? (
              <div className="text-gray-600 mb-4">
                No addresses saved. Please add a shipping address.
              </div>
            ) : (
              <div className="space-y-3 mb-4">
                {addresses.map((address) => (
                  <label
                    key={address.id}
                    className={`block p-4 border rounded-lg cursor-pointer transition ${
                      selectedAddressId === address.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      value={address.id}
                      checked={selectedAddressId === address.id}
                      onChange={(e) => setSelectedAddressId(e.target.value)}
                      className="mr-3"
                    />
                    <span className="font-medium">
                      {address.street}, {address.city}, {address.state} {address.zipCode}
                    </span>
                    {address.isDefault && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Default
                      </span>
                    )}
                  </label>
                ))}
              </div>
            )}

            {!showNewAddressForm ? (
              <button
                onClick={() => setShowNewAddressForm(true)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                + Add New Address
              </button>
            ) : (
              <form onSubmit={handleAddAddress} className="space-y-4 mt-4 border-t pt-4">
                <h3 className="font-semibold">New Address</h3>
                <div>
                  <input
                    type="text"
                    placeholder="Street Address"
                    value={newAddress.street}
                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="City"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="ZIP Code"
                    value={newAddress.zipCode}
                    onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Country"
                    value={newAddress.country}
                    onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newAddress.isDefault}
                    onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                    className="mr-2"
                  />
                  Set as default address
                </label>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Save Address
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewAddressForm(false)}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Payment Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
            
            <div className="space-y-3 mb-6">
              <label className="block p-4 border rounded-lg cursor-pointer hover:border-blue-400">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={selectedPaymentMethod === 'cash'}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <span className="font-medium">Cash on Delivery</span>
              </label>
              
              <label className="block p-4 border rounded-lg cursor-pointer hover:border-blue-400">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={selectedPaymentMethod === 'card'}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <span className="font-medium">Credit/Debit Card</span>
              </label>
              
              <label className="block p-4 border rounded-lg cursor-pointer hover:border-blue-400">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bank_transfer"
                  checked={selectedPaymentMethod === 'bank_transfer'}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <span className="font-medium">Bank Transfer</span>
              </label>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={!selectedAddressId || processing}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition ${
                !selectedAddressId || processing
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {processing ? 'Processing...' : 'Place Order'}
            </button>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-3 pb-3 border-b">
                  {item.product?.imageUrl && (
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <div className="font-medium text-sm">{item.product?.name}</div>
                    <div className="text-sm text-gray-600">
                      Qty: {item.quantity} × ${item.product?.price}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>${cart.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>${(cart.total * 0.1).toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${(cart.total * 1.1).toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 text-xs text-gray-500">
              <p>🔒 Secure checkout</p>
              <p className="mt-2">By placing your order, you agree to our terms and conditions.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
