import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg shadow-xl p-12 text-center">
        <h1 className="text-5xl font-bold mb-4">Welcome to SGVMart</h1>
        <p className="text-xl mb-8">Your one-stop shop for everything you need</p>
        <Link
          to="/products"
          className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 inline-block"
        >
          Shop Now
        </Link>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Fast Delivery</h3>
          <p className="text-gray-600">Get your orders delivered quickly and safely</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Quality Products</h3>
          <p className="text-gray-600">We ensure the highest quality for all our products</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Secure Payment</h3>
          <p className="text-gray-600">Your transactions are safe and secure</p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white p-12 rounded-lg shadow text-center">
        <h2 className="text-3xl font-bold mb-4">Start Shopping Today!</h2>
        <p className="text-gray-600 mb-6">
          Browse our collection of high-quality products at great prices
        </p>
        <Link
          to="/products"
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 inline-block"
        >
          Browse Products
        </Link>
      </section>
    </div>
  );
}
