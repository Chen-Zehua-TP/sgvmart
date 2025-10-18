import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoryItemsService, CategoryItem } from '../services/categoryItems.service';

// Central normalized product interface
interface GGSelProduct {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  percentageSaved?: string;
  imageUrl: string;
  url: string;
  inStock: boolean;
  rating?: string;
  seller?: string;
  salesCount?: string;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GGSelProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categoryItems, setCategoryItems] = useState<Record<string, CategoryItem[]>>({});
  const [loadingCategories, setLoadingCategories] = useState(true);

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
   * Parse GGSel HTML and extract product data from Next.js embedded JSON
   * GGSel is a Next.js app that embeds all page data in __NEXT_DATA__ script tag
   */
  const parseGGSelHTML = (htmlText: string): GGSelProduct[] => {
    try {
      console.log('Starting to parse GGSel HTML...');
      
      // Extract the Next.js data from the HTML
      // Next.js apps embed their data in a script tag with id="__NEXT_DATA__"
      const scriptMatch = htmlText.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s);
      
      if (!scriptMatch) {
        console.error('Could not find __NEXT_DATA__ script tag');
        return [];
      }

      console.log('Found __NEXT_DATA__ script tag');
      const jsonData = JSON.parse(scriptMatch[1]);
      console.log('Parsed JSON data:', Object.keys(jsonData));
      
      // Navigate to the search results data
      // Structure: { props: { pageProps: { searchGoods: { data: [...] } } } }
      const searchData = jsonData?.props?.pageProps?.searchGoods?.data;
      
      if (!searchData || !Array.isArray(searchData)) {
        console.error('Could not find searchGoods data in JSON');
        console.log('Available pageProps keys:', Object.keys(jsonData?.props?.pageProps || {}));
        return [];
      }

      console.log('Found search data with', searchData.length, 'products');
      
      // Map the API products to our normalized format
      const products: GGSelProduct[] = searchData
        .filter((item: any) => item.is_active && !item.hidden_from_search)
        .map((item: any) => {
          // Calculate your selling price: original + $0.50 + 20% margin
          const basePriceFromGGSel = item.price_wmz_for_one;
          const feeAmount = 0.50;
          const marginMultiplier = 1.20; // 20% margin
          const yourSellingPrice = (basePriceFromGGSel + feeAmount) * marginMultiplier;
          
          // Calculate discount and original price
          let originalPrice: string | undefined;
          let percentageSaved: string | undefined;
          
          // Check for category_discount (discount amount in USD)
          if (item.category_discount && item.category_discount > 0) {
            const ggselOriginalPrice = item.price_wmz_for_one + item.category_discount;
            const markedUpOriginalPrice = (ggselOriginalPrice + feeAmount) * marginMultiplier;
            originalPrice = `$${markedUpOriginalPrice.toFixed(2)}`;
            const savings = ((markedUpOriginalPrice - yourSellingPrice) / markedUpOriginalPrice) * 100;
            percentageSaved = `-${Math.round(savings)}%`;
          } 
          // Check for sale percentage
          else if (item.sale && item.sale > 0) {
            const originalVal = yourSellingPrice / (1 - item.sale / 100);
            originalPrice = `$${originalVal.toFixed(2)}`;
            percentageSaved = `-${item.sale}%`;
          }
          
          // Construct image URL
          const imageUrl = item.images
            ? `https://img.ggsel.ru/${item.id_goods}/original/AUTOxAUTO/${item.images}`
            : '';
          
          // Construct product URL
          const productUrl = `https://ggsel.net/en/catalog/product/${item.url}`;
          
          return {
            id: item.id_goods.toString(),
            name: item.name,
            price: `$${yourSellingPrice.toFixed(2)}`,
            originalPrice,
            percentageSaved,
            imageUrl,
            url: productUrl,
            inStock: item.is_active && !item.is_preorder,
            rating: item.rating ? item.rating.toString() : undefined,
            seller: item.search_title || undefined,
            salesCount: item.cnt_sell > 0 ? `${item.cnt_sell}` : undefined,
          };
        });
      
      console.log('Successfully parsed', products.length, 'products');
      return products;
    } catch (err) {
      console.error('Error parsing GGSel HTML:', err);
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
      console.log('Searching for:', query);
      
      // Use the HTML page endpoint and scrape the content
      const searchEndpoint = `https://ggsel.net/en/search/${encodeURIComponent(query)}`;
      const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(searchEndpoint)}`;
      
      console.log('Fetching from:', searchEndpoint);
      console.log('Proxy URL:', proxyUrl);
      
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }

      const htmlText = await response.text();
      console.log('HTML received, length:', htmlText.length);
      
      // Parse HTML and scrape product data
      const products = parseGGSelHTML(htmlText);
      console.log('Products parsed:', products.length);
      console.log('First few products:', products.slice(0, 3));
      
      if (products.length === 0) {
        setError('No products found. Try a different search term.');
      } else {
        setSearchResults(products);
      }
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.message || 'Failed to search products');
    } finally {
      setLoading(false);
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
                <Link
                  key={product.id}
                  to={`/product?pid=${btoa(product.url)}`}
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
                  

                    {/* Category Badge
                    {product.category && (
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded mb-2 inline-block">
                        {product.category}
                      </span>
                    )} */}

                    <div className="mt-auto">
                      {product.originalPrice && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-500 line-through">
                            {product.originalPrice}
                          </span>
                          {product.percentageSaved && (
                            <span className="text-xs text-white bg-red-600 px-2 py-0.5 rounded font-semibold">
                              {product.percentageSaved}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="flex items-baseline gap-2">
                        <div className="text-lg font-bold text-blue-600">
                          {product.price}
                        </div>
                        {!product.originalPrice && product.percentageSaved && (
                          <span className="text-xs text-white bg-red-600 px-2 py-0.5 rounded font-semibold">
                            {product.percentageSaved}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Rating and Sales Count */}
                    <div className="flex items-center justify-between mt-2">
                      {product.rating && (
                        <div className="flex items-center text-yellow-400">
                          <span className="text-xs text-gray-600">★ {product.rating}</span>
                        </div>
                      )}
                      {product.salesCount && (
                        <span className="text-xs text-gray-500">
                          {product.salesCount} sold
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

