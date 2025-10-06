import { useState, useEffect } from 'react';
import { categoryItemsService, CategoryItem } from '../services/categoryItems.service';

interface GGSelProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  url: string;
  inStock: boolean;
  rating?: number;
  seller?: string;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GGSelProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categoryItems, setCategoryItems] = useState<Record<string, CategoryItem[]>>({});
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch category items on component mount
  useEffect(() => {
    const fetchCategoryItems = async () => {
      try {
        setLoadingCategories(true);
        const items = await categoryItemsService.getAllCategoryItems();
        setCategoryItems(items);
      } catch (err) {
        console.error('Error fetching category items:', err);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategoryItems();
  }, []);

  const parseGGSelHTML = (html: string): GGSelProduct[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const products: GGSelProduct[] = [];

    // Find all product cards - adjust selectors based on actual HTML structure
    const productElements = doc.querySelectorAll('.product-card, .product-item, [class*="product"]');
    
    productElements.forEach((element, index) => {
      try {
        // Extract product details - these selectors may need adjustment based on actual HTML
        const nameEl = element.querySelector('.product-title, .product-name, h3, h4, a[class*="title"]');
        const priceEl = element.querySelector('.price, .product-price, [class*="price"]');
        const imageEl = element.querySelector('img') as HTMLImageElement;
        const linkEl = element.querySelector('a') as HTMLAnchorElement;
        
        const name = nameEl?.textContent?.trim() || 'Unknown Product';
        const priceText = priceEl?.textContent?.trim() || '0';
        const price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;
        const imageUrl = imageEl?.src || imageEl?.getAttribute('data-src') || '';
        const url = linkEl?.href || '';

        // Only add if we have at least a name and URL
        if (name && url) {
          products.push({
            id: `product-${index}`,
            name,
            price,
            imageUrl: imageUrl.startsWith('http') ? imageUrl : `https://ggsel.net${imageUrl}`,
            url: url.startsWith('http') ? url : `https://ggsel.net${url}`,
            inStock: true,
          });
        }
      } catch (err) {
        console.error('Error parsing product:', err);
      }
    });

    return products;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }

    performSearch(searchQuery.trim());
  };

  const handleCategoryItemClick = (item: CategoryItem) => {
    // Use the first keyword as the search query
    const keyword = item.keywords[0] || item.name;
    setSearchQuery(keyword);
    performSearch(keyword);
  };

  const performSearch = async (query: string) => {
    setLoading(true);
    setError('');
    setSearchResults([]);

    try {
      const searchEndpoint = `https://ggsel.net/en/search/${encodeURIComponent(query)}`;
      const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(searchEndpoint)}`;
      
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }

      const html = await response.text();
      const products = parseGGSelHTML(html);
      
      if (products.length === 0) {
        setError('No products found. Try a different search term.');
      } else {
        setSearchResults(products);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to search products');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = async (product: GGSelProduct) => {
    try {
      // Calculate discounted price (10% off)
      const discountedPrice = product.price * 0.9;

      // Store order in localStorage for guest users
      const guestOrders = JSON.parse(localStorage.getItem('guestOrders') || '[]');
      const newOrder = {
        id: Date.now().toString(),
        email: 'guest@order.com', // Default email for guest orders
        productName: product.name,
        productUrl: product.url,
        productPrice: discountedPrice,
        originalPrice: product.price,
        productImageUrl: product.imageUrl,
        quantity: 1,
        discount: '10%',
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      };
      
      guestOrders.push(newOrder);
      localStorage.setItem('guestOrders', JSON.stringify(guestOrders));

      setSuccessMessage(`Order placed successfully! You saved $${(product.price * 0.1).toFixed(2)} with 10% discount.`);
      
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to place order. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleAddToCart = async (product: GGSelProduct) => {
    try {
      // Store in localStorage for guest users
      const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
      
      // Check if product already in cart
      const existingIndex = guestCart.findIndex((item: any) => item.productUrl === product.url);
      
      if (existingIndex >= 0) {
        guestCart[existingIndex].quantity += 1;
      } else {
        guestCart.push({
          id: Date.now().toString(),
          productName: product.name,
          productUrl: product.url,
          productPrice: product.price,
          productImageUrl: product.imageUrl,
          quantity: 1,
        });
      }
      
      localStorage.setItem('guestCart', JSON.stringify(guestCart));
      
      setSuccessMessage('Product added to cart!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add to cart. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Search Bar Section */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <h1 className="text-4xl font-bold text-center mb-6 text-gray-900">Search Products</h1>
          
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                className="w-full px-6 py-4 rounded-lg text-gray-900 text-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
            {error && (
              <div className="mt-3 text-red-600 text-sm text-center bg-red-50 py-2 px-4 rounded">{error}</div>
            )}
            {successMessage && (
              <div className="mt-3 text-green-600 text-sm text-center bg-green-50 py-2 px-4 rounded">{successMessage}</div>
            )}
          </form>
        </div>

        {/* Category Items Section */}
        {!loadingCategories && Object.keys(categoryItems).length > 0 && searchResults.length === 0 && (
          <div className="space-y-8 mb-8">
            {Object.entries(categoryItems).map(([category, items]) => (
              items.length > 0 && (
                <div key={category} className="bg-white rounded-lg shadow-xl p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2">
                      {category === 'Games' && '🎮'}
                      {category === 'Digital Currency & Items' && '💰'}
                      {category === 'Software Products' && '💻'}
                      {category === 'Gift Cards' && '🎁'}
                      {category === 'Subscriptions' && '📺'}
                    </span>
                    {category}
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleCategoryItemClick(item)}
                        className="group bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-2 border-blue-200 hover:border-blue-400 rounded-lg p-4 transition-all duration-200 text-left shadow-sm hover:shadow-md"
                      >
                        <div className="flex flex-col items-center text-center">
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded-lg mb-2"
                            />
                          )}
                          <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 line-clamp-2">
                            {item.name}
                          </h3>
                          {item.description && (
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        )}

        {loadingCategories && searchResults.length === 0 && (
          <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading popular items...</span>
            </div>
          </div>
        )}

        {/* Search Results Section */}
        {searchResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Search Results for "{searchQuery}"</h2>
                <p className="text-gray-600 mt-1">{searchResults.length} products found</p>
              </div>
              <button
                onClick={() => {
                  setSearchResults([]);
                  setSearchQuery('');
                }}
                className="text-blue-600 hover:text-blue-800 font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 transition"
              >
                Clear Results
              </button>
            </div>
            
            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {searchResults.map((product) => (
                <a
                  key={product.id}
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col"
                >
                  {/* Product Image */}
                  <div className="relative w-full h-48 bg-gray-100 flex items-center justify-center">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=No+Image';
                        }}
                      />
                    ) : (
                      <div className="text-gray-400 text-sm">No Image</div>
                    )}
                    {product.inStock && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                        In Stock
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2 min-h-[2.5rem]">
                      {product.name}
                    </h3>
                    
                    {product.seller && (
                      <p className="text-xs text-gray-500 mb-2">
                        by {product.seller}
                      </p>
                    )}

                    <div className="mt-auto">
                      {product.originalPrice && product.originalPrice > product.price && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-500 line-through">
                            ${product.originalPrice.toFixed(2)}
                          </span>
                          <span className="text-xs text-red-600 font-semibold">
                            Save ${(product.originalPrice - product.price).toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="text-lg font-bold text-blue-600">
                        ${product.price.toFixed(2)}
                      </div>
                    </div>

                    {product.rating && (
                      <div className="flex items-center mt-2">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < Math.floor(product.rating!) ? 'fill-current' : 'fill-gray-300'}`}
                              viewBox="0 0 20 20"
                            >
                              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-xs text-gray-600 ml-1">({product.rating})</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="px-4 pb-4 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleBuyNow(product);
                      }}
                      className="flex-1 bg-green-600 text-white text-center py-2 rounded-lg font-semibold hover:bg-green-700 transition text-sm"
                    >
                      Buy
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToCart(product);
                      }}
                      className="flex-1 bg-blue-600 text-white text-center py-2 rounded-lg font-semibold hover:bg-blue-700 transition text-sm"
                    >
                      Add to Cart
                    </button>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

