import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

export default function Marketplace() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    axios.get('/api/products?status=approved')
      .then(res => {
        setProducts(res.data);
        setFiltered(res.data);
      });
  }, []);

  useEffect(() => {
    let result = products.filter(p =>
      p.title.toLowerCase().includes(query.toLowerCase()) &&
      (!minPrice || p.price >= minPrice) &&
      (!maxPrice || p.price <= maxPrice)
    );
    setFiltered(result);
  }, [query, minPrice, maxPrice, products]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Marketplace</h1>

      <div className="mb-6 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border px-3 py-2 rounded w-60"
        />
        <input
          type="number"
          placeholder="Min Price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="border px-3 py-2 rounded w-32"
        />
        <input
          type="number"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="border px-3 py-2 rounded w-32"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filtered.map(product => (
          <Link key={product._id} href={`/item/${product._id}`} className="bg-white rounded shadow p-4 hover:shadow-lg">
            <img
              src={product.photos?.[0] || '/placeholder.png'}
              alt={product.title}
              className="h-40 w-full object-cover rounded mb-2"
            />
            <h3 className="font-semibold text-lg">{product.title}</h3>
            <p className="text-gray-700">₦{product.price}</p>
            <p className="text-sm text-gray-600">📞 {product.phone}</p>
            <p className="text-sm text-gray-500 mt-1 capitalize">Category: {product.category}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
