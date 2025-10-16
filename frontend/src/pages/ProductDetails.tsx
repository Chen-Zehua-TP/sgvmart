import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

interface ProductDetails {
  name: string;
  price: string;
  originalPrice?: string;
  percentageSaved?: string;
  imageUrl: string;
  description?: string;
  seller?: string;
  rating?: string;
  salesCount?: string;
  inStock: boolean;
  productType?: string;
  ggselUrl: string;
}

export default function ProductDetails() {
  const [searchParams] = useSearchParams();
  const encodedUrl = searchParams.get('pid');
  
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (encodedUrl) {
      try {
        const productUrl = atob(encodedUrl);
        fetchProductDetails(productUrl);
      } catch (e) {
        setError('Invalid product identifier');
        setLoading(false);
      }
    } else {
      setError('No product identifier provided');
      setLoading(false);
    }
  }, [encodedUrl]);

  const fetchProductDetails = async (url: string) => {
    setLoading(true);
    setError('');

    try {
      console.log('Fetching product from:', url);
      
      // Use CORS proxy to fetch the product page
      const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch product details');
      }

      const htmlText = await response.text();
      console.log('HTML received, length:', htmlText.length);
      
      // Parse the product details from the HTML
      const productData = parseProductHTML(htmlText, url);
      
      if (!productData) {
        throw new Error('Could not parse product details');
      }
      
      setProduct(productData);
    } catch (err: any) {
      console.error('Error fetching product:', err);
      setError(err.message || 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const parseProductHTML = (htmlText: string, originalUrl: string): ProductDetails | null => {
    try {
      // Extract the Next.js data from the HTML
      const scriptMatch = htmlText.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s);
      
      if (!scriptMatch) {
        console.error('Could not find __NEXT_DATA__ script tag');
        return null;
      }

      const jsonData = JSON.parse(scriptMatch[1]);
      console.log('Parsed JSON data');
      
      // Navigate to the product data
      // Structure: { props: { pageProps: { productData: {...} } } }
      const productData = jsonData?.props?.pageProps?.productData;
      
      if (!productData) {
        console.error('Could not find product data in JSON');
        console.error('Available pageProps keys:', Object.keys(jsonData?.props?.pageProps || {}));
        return null;
      }

      console.log('Found product data:', productData.name);
      
      // Calculate discount and original price
      let originalPrice: string | undefined;
      let percentageSaved: string | undefined;
      
      if (productData.old_price && productData.old_price > 0) {
        originalPrice = `$${productData.old_price.toFixed(2)}`;
        const savings = ((productData.old_price - productData.price_wmz) / productData.old_price) * 100;
        percentageSaved = `-${Math.round(savings)}%`;
      } else if (productData.sale && productData.sale > 0) {
        const originalVal = productData.price_wmz / (1 - productData.sale / 100);
        originalPrice = `$${originalVal.toFixed(2)}`;
        percentageSaved = `-${productData.sale}%`;
      }
      
      // Construct image URL
      const imageUrl = productData.images
        ? `https://img.ggsel.ru/${productData.id_goods}/original/AUTOxAUTO/${productData.images}`
        : '';
      
      // Clean HTML from description
      const cleanDescription = (html: string) => {
        return html
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<[^>]*>/g, '')
          .replace(/&nbsp;/g, ' ')
          .trim();
      };
      
      return {
        name: productData.name,
        price: `$${productData.price_wmz.toFixed(2)}`,
        originalPrice,
        percentageSaved,
        imageUrl,
        description: cleanDescription(productData.info || ''),
        seller: productData.seller?.name_seller || 'Unknown',
        rating: productData.rating ? productData.rating.toString() : undefined,
        salesCount: productData.cnt_sell > 0 ? productData.cnt_sell.toString() : undefined,
        inStock: productData.is_active && !productData.is_preorder,
        productType: productData.category?.title || '',
        ggselUrl: originalUrl,
      };
    } catch (err) {
      console.error('Error parsing product HTML:', err);
      return null;
    }
  };

  const handleBuyOnWhatsApp = () => {
    if (product) {
      const phoneNumber = '6596581652'; // +65 9658 1652 without + and spaces
      // Encode the full product URL for tracking
      const productRef = btoa(product.ggselUrl);
      const message = encodeURIComponent(
        `Hi! I'm interested in buying this product:\n\n${product.name}\nPrice: ${product.price}\n\nProduct Reference: ${productRef}`
      );
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading product details...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Product</h2>
              <p className="text-red-600 mb-6">{error || 'Product not found'}</p>
              <Link
                to="/"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 font-semibold"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Search
        </Link>

        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            {/* Product Image */}
            <div className="flex items-center justify-center bg-gray-100 rounded-lg p-8">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="max-w-full max-h-96 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=No+Image';
                  }}
                />
              ) : (
                <div className="text-gray-400">No Image Available</div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

              {/* Rating and Sales */}
              <div className="flex items-center gap-4 mb-6">
                {product.rating && (
                  <div className="flex items-center">
                    <span className="text-yellow-400 text-xl">★</span>
                    <span className="ml-1 text-gray-700 font-semibold">{product.rating}</span>
                  </div>
                )}
                {product.salesCount && (
                  <span className="text-gray-600">
                    {product.salesCount} sales
                  </span>
                )}
                {product.inStock && (
                  <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                    In Stock
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="mb-6">
                {product.originalPrice && (
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl text-gray-500 line-through">
                      {product.originalPrice}
                    </span>
                    {product.percentageSaved && (
                      <span className="bg-red-600 text-white text-sm px-3 py-1 rounded-full font-semibold">
                        {product.percentageSaved}
                      </span>
                    )}
                  </div>
                )}
                <div className="text-4xl font-bold text-blue-600">
                  {product.price}
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <div 
                    className="text-gray-700 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                </div>
              )}

              {/* Buy Button */}
              <button
                onClick={handleBuyOnWhatsApp}
                className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Contact on WhatsApp
              </button>

              <p className="text-xs text-gray-500 text-center mt-3">
                Phone: +65 9658 1652 • Click to message us on WhatsApp
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
