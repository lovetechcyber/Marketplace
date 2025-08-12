import Link from 'next/link';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    axios.get('/api/auth/me', { withCredentials: true })
      .then(res => setUser(res.data))
      .catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    await axios.post('/api/auth/logout', {}, { withCredentials: true });
    setUser(null);
    router.push('/login');
  };

  return (
    <nav className="bg-white border-b shadow-sm px-4 py-4 flex flex-wrap justify-between items-center">
      <Link href="/" className="text-2xl font-bold text-blue-600">MarketSecure</Link>

      <div className="flex flex-wrap items-center gap-4 mt-2 md:mt-0">
        <Link href="/" className="text-sm text-gray-700 hover:underline">Home</Link>
        <Link href="/marketplace" className="text-sm text-gray-700 hover:underline">Marketplace</Link>
        <Link href="/post" className="text-sm text-gray-700 hover:underline">Post Item</Link>
        {user ? (
          <div className="flex items-center gap-2">
            <Link href="/profile" className="text-sm text-gray-800 font-medium">{user.fullName || 'Profile'}</Link>
            <button onClick={handleLogout} className="text-sm text-red-500">Logout</button>
          </div>
        ) : (
          <Link href="/login" className="text-sm text-blue-500 hover:underline">Login / Register</Link>
        )}
      </div>
    </nav>
  );
}
