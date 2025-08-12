/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function Checkout() {
  const router = useRouter();
  const { productId } = router.query;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (productId) {
      axios.get(`/api/products/${productId}`)
        .then(res => setProduct(res.data))
        .catch(() => setError('Product not found'));
    }
  }, [productId]);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/api/payment/initiate', {
        productId: product._id,
        amount: product.price
      }, { withCredentials: true });

      // Redirect to payment gateway
      window.location.href = res.data.paymentUrl;
    } catch (err) {
      setError('Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  if (error) return <p className="p-6 text-red-500">{error}</p>;
  if (!product) return <p className="p-6">Loading...</p>;

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-xl mx-auto bg-white rounded shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Checkout</h1>
        <img src={product.photos?.[0]} alt={product.title} className="w-full h-48 object-cover rounded mb-4" />
        <p className="text-lg font-semibold">{product.title}</p>
        <p className="text-blue-600 text-lg mb-2">₦{product.price}</p>
        <p className="text-gray-700 mb-4">{product.description}</p>

        <button
          onClick={handlePayment}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Pay Now'}
        </button>
      </div>
    </div>
  );
}
