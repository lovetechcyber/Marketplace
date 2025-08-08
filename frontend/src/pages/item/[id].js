/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      axios.get(`/api/products/${id}`)
        .then(res => {
          setProduct(res.data);
          fetchRelated(res.data.category, res.data._id);
        })
        .catch(() => setError('Product not found'));
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      const existing = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      const updated = [id, ...existing.filter(pid => pid !== id)].slice(0, 6);
      localStorage.setItem('recentlyViewed', JSON.stringify(updated));
    }
  }, [id]);

  useEffect(() => {
    const ids = JSON.parse(localStorage.getItem('recentlyViewed') || '[]').filter(pid => pid !== id);
    if (ids.length) {
      axios.post('/api/products/recent', { ids })
        .then(res => setRecentlyViewed(res.data))
        .catch(err => console.error(err));
    }
  }, [id]);

  const fetchRelated = async (category, currentId) => {
    try {
      const res = await axios.get(`/api/products?status=approved&category=${category}`);
      const filtered = res.data.filter(p => p._id !== currentId);
      setRelated(filtered);
    } catch (err) {
      console.error('Error fetching related products');
    }
  };

  const handleChat = async () => {
    try {
      const res = await axios.post('/api/chat/start', { sellerId: product.sellerId }, { withCredentials: true });
      router.push(`/chat?roomId=${res.data.roomId}`);
    } catch (err) {
      alert('Unable to start chat. Please login.');
    }
  };

  const handleBuy = async () => {
    router.push(`/checkout?productId=${product._id}`);
  };

  if (error) return <p className="p-6 text-red-500">{error}</p>;
  if (!product) return <p className="p-6">Loading...</p>;

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-4xl mx-auto bg-white rounded shadow p-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            {product.photos?.[0] && (
              <img
                src={product.photos[0]}
                alt="product image"
                className="w-full h-64 object-cover rounded mb-4"
              />
            )}
            {product.videoReel && (
              <video controls className="w-full rounded">
                <source src={product.videoReel} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>

          <div>
            <h1 className="text-2xl font-bold mb-2">{product.title}</h1>
            <p className="text-lg text-blue-600 mb-1">₦{product.price}</p>
            <p className="mb-4 text-gray-700">{product.description}</p>

            <div className="mb-4">
              <p className="font-semibold text-sm text-gray-800">Seller Info</p>
              <div className="flex items-center gap-3 mt-1">
                <img src={product.sellerAvatar || '/avatar.png'} alt="avatar" className="w-10 h-10 rounded-full" />
                <div>
                  <p className="text-sm font-medium">{product.sellerName || 'Verified Seller'}</p>
                  <p className="text-xs text-gray-500">📞 {product.phone}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={handleChat} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Chat with Seller
              </button>
              <button onClick={handleBuy} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="max-w-6xl mx-auto mt-10">
          <h3 className="text-xl font-semibold mb-4">Related Products</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {related.map(r => (
              <Link href={`/item/${r._id}`} key={r._id} className="bg-white rounded shadow p-3 hover:shadow-md">
                <img src={r.photos?.[0]} alt={r.title} className="h-40 w-full object-cover rounded mb-2" />
                <h4 className="font-semibold text-md">{r.title}</h4>
                <p className="text-sm text-gray-600">₦{r.price}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {recentlyViewed.length > 0 && (
        <div className="max-w-6xl mx-auto mt-10">
          <h3 className="text-xl font-semibold mb-4">Recently Viewed</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {recentlyViewed.map(p => (
              <Link key={p._id} href={`/item/${p._id}`} className="bg-white rounded shadow p-3 hover:shadow-md">
                <img src={p.photos?.[0]} alt={p.title} className="h-40 w-full object-cover rounded mb-2" />
                <h4 className="font-semibold text-md">{p.title}</h4>
                <p className="text-sm text-gray-600">₦{p.price}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
