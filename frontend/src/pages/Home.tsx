import { useState, useEffect } from 'react';
import { categoryItemsService, CategoryItem } from '../services/categoryItems.service';

// GGSel API Response Interface
interface GGSelApiProduct {
  id_goods: number;
  url: string;
  is_active: boolean;
  id_section: number;
  id_seller: number;
  seller_name: string;
  name: string;
  summpay: string;
  images: string;
  forbidden_type: number;
  price_wmr: string;
  price_wmz: string;
  price_wme: string;
  cnt_sell: number;
  rating: number;
  content_type_id: number;
  search_title: string;
  hidden_from_parents: boolean;
  hidden_from_search: boolean;
  sale: number | null;
  category_discount: number | null;
  content_type_sort: number | null;
  max_cnt_sell: number | null;
  unit_name: string | null;
  steam_discount: number | null;
  price_wmr_for_one: number;
  price_wmz_for_one: number;
  price_wme_for_one: number;
  is_preorder: boolean;
  is_sku: boolean;
  sku_id: number | null;
  buy_box_id: number | null;
  payment_code: string;
  payment_url: string | null;
  sort: number[];
  in_favorites: boolean;
}

interface GGSelApiResponse {
  pageProps: {
    searchGoods: {
      data: GGSelApiProduct[];
    };
  };
}

// Central normalized product interface
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
  discount?: number;
  salesCount?: number;
  category?: string;
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

  /**
   * Map GGSel API product to normalized product structure
   * This is the central dictionary/mapping function
   * 
   * Mapping Rules:
   * - id: id_goods converted to string
   * - name: Direct mapping from name field
   * - price: price_wmz_for_one (USD equivalent)
   * - originalPrice: Calculated from category_discount or sale percentage
   * - imageUrl: Constructed from images and id_goods with GGSel CDN URL
   *   Format: https://img.ggsel.ru/{id_goods}/original/AUTOxAUTO/{images}
   * - url: Constructed product URL using url slug
   * - inStock: is_active && !is_preorder
   * - rating: Direct mapping from rating field
   * - seller: Direct mapping from seller_name
   * - discount: Calculated percentage from category_discount or sale
   * - salesCount: Direct mapping from cnt_sell
   * - category: Direct mapping from search_title
   */
  const mapGGSelProductToNormalized = (apiProduct: GGSelApiProduct): GGSelProduct => {
    // Calculate discount percentage if applicable
    let discount: number | undefined;
    let originalPrice: number | undefined;

    // category_discount is the discount amount in the same currency (USD)
    // The original price is: current_price + discount_amount
    if (apiProduct.category_discount && apiProduct.category_discount > 0) {
      originalPrice = apiProduct.price_wmz_for_one + apiProduct.category_discount;
      discount = Math.round((apiProduct.category_discount / originalPrice) * 100);
    } else if (apiProduct.sale && apiProduct.sale > 0) {
      // sale is already a percentage
      discount = apiProduct.sale;
      originalPrice = apiProduct.price_wmz_for_one / (1 - apiProduct.sale / 100);
    }

    // Construct image URL - GGSel uses img.ggsel.ru CDN with id_goods in path
    const imageUrl = apiProduct.images
      ? `https://img.ggsel.ru/${apiProduct.id_goods}/original/AUTOxAUTO/${apiProduct.images}`
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(apiProduct.name)}&size=300&background=4F46E5&color=fff&bold=true`;

    // Construct product URL
    const productUrl = `https://ggsel.net/en/catalog/product/${apiProduct.url}`;

    return {
      id: apiProduct.id_goods.toString(),
      name: apiProduct.name,
      price: apiProduct.price_wmz_for_one, // Using WMZ (USD equivalent)
      originalPrice,
      imageUrl,
      url: productUrl,
      inStock: apiProduct.is_active && !apiProduct.is_preorder,
      rating: apiProduct.rating,
      seller: apiProduct.seller_name,
      discount,
      salesCount: apiProduct.cnt_sell,
      category: apiProduct.search_title,
    };
  };

  /**
   * Parse GGSel JSON API response and map to normalized products
   */
  const parseGGSelJSON = (jsonData: GGSelApiResponse): GGSelProduct[] => {
    try {
      const apiProducts = jsonData.pageProps?.searchGoods?.data || [];
      
      // Map each API product to normalized structure using central dictionary
      return apiProducts
        .filter(product => product.is_active && !product.hidden_from_search)
        .map(mapGGSelProductToNormalized);
    } catch (err) {
      console.error('Error parsing GGSel JSON:', err);
      return [];
    }
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
      // Use the JSON API endpoint instead of HTML
      const searchEndpoint = `https://ggsel.net/_next/data/DCG0vPgzxhYBXgxA1RmQ2/en/search/${encodeURIComponent(query)}.json?search_term=${encodeURIComponent(query)}`;
      const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(searchEndpoint)}`;
      
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }

      const jsonData: GGSelApiResponse = await response.json();
      
      // Use the central mapping function to normalize products
      const products = parseGGSelJSON(jsonData);
      
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
      // Store order in localStorage for guest users
      const guestOrders = JSON.parse(localStorage.getItem('guestOrders') || '[]');
      const newOrder = {
        id: Date.now().toString(),
        email: 'guest@order.com', // Default email for guest orders
        productName: product.name,
        productUrl: product.url,
        productPrice: product.price,
        productImageUrl: product.imageUrl,
        quantity: 1,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      };
      
      guestOrders.push(newOrder);
      localStorage.setItem('guestOrders', JSON.stringify(guestOrders));

      setSuccessMessage('Order placed successfully!');
      
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
                    {items.map((item) => {
                      // Generate image URL if not provided
                      const getItemImage = () => {
                        if (item.imageUrl) {
                          return item.imageUrl;
                        }
                        // Use Google Images via a proxy service
                        // Using Clearbit for company/brand logos
                        return `https://logo.clearbit.com/${item.name.toLowerCase().replace(/\s+/g, '')}.com`;
                      };

                      return (
                        <button
                          key={item.id}
                          onClick={() => handleCategoryItemClick(item)}
                          className="group bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-2 border-blue-200 hover:border-blue-400 rounded-lg p-4 transition-all duration-200 text-left shadow-sm hover:shadow-md"
                        >
                          <div className="flex flex-col items-center text-center">
                            <img
                              src={getItemImage()}
                              alt={item.name}
                              className="w-16 h-16 object-contain rounded-lg mb-2 bg-white p-1"
                              onError={(e) => {
                                // Fallback: Try alternative image sources
                                const target = e.target as HTMLImageElement;
                                if (!target.dataset.fallbackAttempted) {
                                  target.dataset.fallbackAttempted = 'true';
                                  // Use UI Avatars as fallback with item name
                                  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&size=100&background=4F46E5&color=fff&bold=true`;
                                }
                              }}
                            />
                            <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 line-clamp-2">
                              {item.name}
                            </h3>
                          </div>
                        </button>
                      );
                    })}
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
                  <div className="relative w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="max-w-full max-h-full object-contain p-2"
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

                    {/* Category Badge
                    {product.category && (
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded mb-2 inline-block">
                        {product.category}
                      </span>
                    )} */}

                    <div className="mt-auto">
                      {product.originalPrice && product.originalPrice > product.price && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-500 line-through">
                            ${product.originalPrice.toFixed(2)}
                          </span>
                          {product.discount && (
                            <span className="text-xs text-white bg-red-600 px-2 py-0.5 rounded font-semibold">
                              -{product.discount}%
                            </span>
                          )}
                        </div>
                      )}
                      <div className="text-lg font-bold text-blue-600">
                        ${product.price.toFixed(2)}
                      </div>
                    </div>

                    {/* Rating and Sales Count */}
                    <div className="flex items-center justify-between mt-2">
                      {product.rating && (
                        <div className="flex items-center">
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
                      {product.salesCount !== undefined && product.salesCount > 0 && (
                        <span className="text-xs text-gray-500">
                          {product.salesCount} sold
                        </span>
                      )}
                    </div>
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

