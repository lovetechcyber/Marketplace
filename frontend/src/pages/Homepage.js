import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => {
    axios.get('/api/products?status=approved')
      .then(res => {
        setProducts(res.data);
        setFiltered(res.data);
      });
  }, []);

  useEffect(() => {
    let result = [...products];
    if (search) result = result.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));
    if (category) result = result.filter(p => p.category === category);
    if (price) {
      const [min, max] = price.split('-').map(Number);
      result = result.filter(p => p.price >= min && p.price <= max);
    }
    setFiltered(result);
  }, [search, category, price]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="bg-gray-100 py-16 px-6 text-center">
        <h1 className="text-4xl font-bold mb-4">Buy and Sell Safely with Escrow Protection</h1>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto">
          Shop confidently for kitchenware and electronics from trusted sellers. Your money is safe — we only release it after confirmed delivery.
        </p>
        <div className="mt-6">
          <Link href="/post" className="bg-blue-600 text-white px-6 py-3 rounded font-semibold hover:bg-blue-700">Post Your Product</Link>
        </div>
      </section>

      <div className="px-6 py-4">
        <h2 className="text-xl font-semibold mb-4">Browse Products</h2>
        <div className="flex flex-wrap gap-4 mb-6">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border p-2 rounded w-full md:w-1/3"
          />

          <select onChange={e => setCategory(e.target.value)} className="border p-2 rounded">
            <option value="">All Categories</option>
            <option value="kitchen">Kitchen</option>
            <option value="electronics">Electronics</option>
          </select>

          <select onChange={e => setPrice(e.target.value)} className="border p-2 rounded">
            <option value="">All Prices</option>
            <option value="0-5000">₦0 - ₦5,000</option>
            <option value="5000-10000">₦5,000 - ₦10,000</option>
            <option value="10000-50000">₦10,000 - ₦50,000</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filtered.map(product => (
            <Link href={`/item/${product._id}`} key={product._id} className="border rounded shadow hover:shadow-md transition">
              <div className="w-full h-48 relative">
                <Image
                  src={product.photos[0] || '/placeholder.png'}
                  layout="fill"
                  objectFit="cover"
                  alt={product.title}
                  className="rounded-t"
                />
              </div>
              <div className="p-4">
                <h2 className="font-bold text-lg mb-1">{product.title}</h2>
                <p className="text-gray-600">₦{product.price.toLocaleString()}</p>
                <span className="text-xs bg-gray-200 rounded-full px-2 py-1 mt-2 inline-block">{product.category}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="px-6 py-6 bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">Recent Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {products.slice(0, 4).map(p => (
            <Link href={`/item/${p._id}`} key={p._id} className="border rounded">
              <Image src={p.photos[0] || '/placeholder.png'} alt={p.title} width={300} height={200} className="rounded-t" />
              <div className="p-2">
                <p className="font-medium">{p.title}</p>
                <p className="text-sm text-gray-500">₦{p.price.toLocaleString()}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
