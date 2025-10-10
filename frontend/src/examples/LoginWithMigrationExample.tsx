/**
 * Example: Login with Order Migration
 * 
 * Shows how to integrate order migration into login flow
 * Automatically converts guest orders to member orders
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { orderService } from '../services/order.service';

export const LoginWithMigrationExample: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [migrationInfo, setMigrationInfo] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMigrationInfo(null);
    setLoading(true);

    try {
      // 1. Authenticate user
      const response = await authService.login(email, password);
      
      console.log('Login successful:', response);
      
      // 2. Check for pending guest orders
      const hasPendingOrders = orderService.hasPendingGuestOrders();
      
      if (hasPendingOrders) {
        console.log('Found pending guest orders, migrating...');
        
        try {
          // 3. Migrate guest orders to member account
          const migrationResult = await orderService.migrateGuestOrders();
          
          if (migrationResult.success && migrationResult.migratedCount > 0) {
            setMigrationInfo(
              `Welcome back! We found ${migrationResult.migratedCount} order(s) from your guest session and linked them to your account.`
            );
            
            // Wait 2 seconds to show message
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }
        } catch (migrationError) {
          // Don't block login if migration fails
          console.error('Migration failed (non-critical):', migrationError);
        }
      }
      
      // 4. Navigate to dashboard
      navigate('/dashboard');
      
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const guestOrderCount = orderService.getGuestOrdersCount();

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Login</h1>
      
      {/* Guest Order Notice */}
      {guestOrderCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-4">
          <p className="text-sm">
            📦 You have <strong>{guestOrderCount} pending order(s)</strong> from your guest session.
            <br />
            They will be automatically linked to your account after login.
          </p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {migrationInfo && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          {migrationInfo}
        </div>
      )}
      
      <form onSubmit={handleLogin} className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="your@email.com"
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <p className="text-center mt-4 text-sm text-gray-600">
        Don't have an account?{' '}
        <a href="/register" className="text-blue-600 hover:underline">
          Sign up
        </a>
      </p>
    </div>
  );
};
