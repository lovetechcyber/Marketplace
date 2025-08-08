import { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import Script from 'next/script';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [activeTab, setActiveTab] = useState('settings');
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUser();
    fetchTransactions();
    fetchWithdrawals();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await axios.get('/api/user/me', { withCredentials: true });
      setUser(res.data);
    } catch (err) {
      console.error('Failed to fetch user', err);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await axios.get('/api/transactions/by-user', { withCredentials: true });
      setTransactions(res.data);
    } catch (err) {
      console.error('Failed to fetch transactions', err);
    }
  };

  const fetchWithdrawals = async () => {
    try {
      const res = await axios.get('/api/withdrawals/by-user', { withCredentials: true });
      setWithdrawals(res.data);
    } catch (err) {
      console.error('Failed to fetch withdrawals', err);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'YOUR_CLOUDINARY_PRESET');
    const uploadRes = await fetch('https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await uploadRes.json();
    setPhoto(data.secure_url);

    await axios.put('/api/user/update-photo', { photo: data.secure_url }, { withCredentials: true });
    fetchUser();
  };

  const handleFaceVerification = () => {
    if (!window.Dojah) return alert('Dojah not loaded');
    window.Dojah.init({
      app_id: process.env.NEXT_PUBLIC_DOJAH_APP_ID,
      type: 'liveness',
      user_data: { first_name: user.fullName, last_name: '' },
      onSuccess: async (res) => {
        const verify = await axios.post('/api/user/verify-face', {
          verification_id: res.data.verification_id
        }, { withCredentials: true });

        if (verify.data.verified) handleWithdraw();
        else alert('Face not verified. Try again.');
      },
      onClose: () => alert('Face verification cancelled'),
    });
  };

  const handleWithdraw = async () => {
    try {
      await axios.post('/api/user/request-withdrawal', {}, { withCredentials: true });
      alert('Withdrawal request submitted');
      fetchWithdrawals();
    } catch (err) {
      console.error('Withdrawal request failed', err);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      setMessage('New passwords do not match');
      return;
    }
    try {
      await axios.put('/api/user/change-password', passwords, { withCredentials: true });
      setMessage('Password updated successfully');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update password');
    }
  };

  if (!user) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Script src="https://widget.dojah.io/widget.js" strategy="beforeInteractive" />

      <aside className="bg-white border-r w-full md:w-64 p-4">
        <div className="flex items-center gap-3 mb-6">
          <Image src={user.photo || '/avatar.png'} width={40} height={40} alt="avatar" className="rounded-full" />
          <div>
            <h2 className="font-semibold text-sm">{user.fullName}</h2>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
        <nav className="space-y-2">
          <button className={`w-full text-left px-3 py-2 rounded ${activeTab === 'settings' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`} onClick={() => setActiveTab('settings')}>Settings</button>
          <button className={`w-full text-left px-3 py-2 rounded ${activeTab === 'transactions' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`} onClick={() => setActiveTab('transactions')}>Transaction History</button>
          <button className={`w-full text-left px-3 py-2 rounded ${activeTab === 'listings' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`} onClick={() => setActiveTab('listings')}>My Listings</button>
        </nav>
      </aside>

      <main className="flex-1 p-6 bg-gray-50">
        {activeTab === 'settings' && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Profile Settings</h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <Image src={user.photo || '/avatar.png'} width={60} height={60} alt="avatar" className="rounded-full" />
                <input
                  type="file"
                  onChange={handlePhotoChange}
                  className="absolute top-0 left-0 w-16 h-16 opacity-0 cursor-pointer"
                  title="Update Photo"
                />
              </div>
              <div>
                <p><strong>Name:</strong> {user.fullName}</p>
                <p><strong>Email:</strong> {user.email}</p>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className="max-w-md bg-white p-4 rounded shadow">
              <h4 className="font-semibold mb-2">Change Password</h4>
              {message && <p className="text-sm text-red-500 mb-2">{message}</p>}
              <input type="password" placeholder="Current Password" className="w-full border px-3 py-2 rounded mb-2" value={passwords.current} onChange={e => setPasswords({ ...passwords, current: e.target.value })} required />
              <input type="password" placeholder="New Password" className="w-full border px-3 py-2 rounded mb-2" value={passwords.new} onChange={e => setPasswords({ ...passwords, new: e.target.value })} required />
              <input type="password" placeholder="Confirm New Password" className="w-full border px-3 py-2 rounded mb-2" value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} required />
              <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">Update Password</button>
            </form>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Wallet Balance: ₦{user.walletBalance || 0}</h3>
            <button onClick={handleFaceVerification} className="mb-4 px-4 py-2 bg-blue-600 text-white rounded">Withdraw (Face ID)</button>
            <div className="mb-8">
              <h4 className="font-semibold mb-2">Withdrawal History</h4>
              {withdrawals.length > 0 ? (
                <ul className="text-sm">
                  {withdrawals.map(w => (
                    <li key={w._id} className="mb-1 border-b pb-1">
                      ₦{w.amount} - {w.status} - {new Date(w.createdAt).toLocaleDateString()}
                    </li>
                  ))}
                </ul>
              ) : <p className="text-gray-500">No withdrawals yet.</p>}
            </div>

            <div>
              <h4 className="font-semibold mb-2">Purchased Items</h4>
              {transactions.filter(t => t.buyerId === user._id).length ? (
                <ul>
                  {transactions.filter(t => t.buyerId === user._id).map((t) => (
                    <li key={t._id} className="mb-2 border-b pb-2">
                      <p className="font-medium">{t.product?.title || 'Product'}</p>
                      <p className="text-sm text-gray-600">₦{t.amount}</p>
                    </li>
                  ))}
                </ul>
              ) : <p>No purchases yet.</p>}

              <h4 className="font-semibold mt-6 mb-2">Sold Items</h4>
              {transactions.filter(t => t.sellerId === user._id).length ? (
                <ul>
                  {transactions.filter(t => t.sellerId === user._id).map((t) => (
                    <li key={t._id} className="mb-2 border-b pb-2">
                      <p className="font-medium">{t.product?.title || 'Product'}</p>
                      <p className="text-sm text-gray-600">₦{t.amount}</p>
                    </li>
                  ))}
                </ul>
              ) : <p>No sales yet.</p>}
            </div>
          </div>
        )}

        {activeTab === 'listings' && (
          <div>
            <h3 className="text-lg font-semibold mb-3">My Listings</h3>
            {user.products?.length ? (
              <ul>
                {user.products.map((prod) => (
                  <li key={prod._id} className="mb-2 border-b pb-2">
                    <p className="font-medium">{prod.title}</p>
                    <p className="text-sm text-gray-600">₦{prod.price}</p>
                  </li>
                ))}
              </ul>
            ) : <p>No listings yet.</p>}
          </div>
        )}
      </main>
    </div>
  );
}
