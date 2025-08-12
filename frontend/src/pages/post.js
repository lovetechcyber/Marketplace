import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function PostPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    title: '',
    category: 'kitchen',
    price: '',
    phone: '',
    photos: [],
    video: null,
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get('/api/auth/me', { withCredentials: true })
      .then(res => {
        if (res.data.kycStatus !== 'approved') {
          router.push('/kyc');
        } else {
          setUser(res.data);
        }
      })
      .catch(() => router.push('/login'));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === 'photos') {
      setForm({ ...form, photos: files });
    } else {
      setForm({ ...form, video: files[0] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('category', form.category);
    formData.append('price', form.price);
    formData.append('phone', form.phone);
    Array.from(form.photos).forEach((file) => formData.append('photos', file));
    if (form.video) formData.append('video', form.video);

    try {
      await axios.post('/api/products', formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage('Product posted successfully');
      router.push('/marketplace');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center items-start">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Post a Product</h2>

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        {message && <p className="text-green-600 text-sm mb-2">{message}</p>}

        <input
          type="text"
          name="title"
          placeholder="Product Title"
          value={form.title}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded mb-3"
        />

        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded mb-3"
        >
          <option value="kitchen">Kitchen</option>
          <option value="electronics">Electronics</option>
        </select>

        <input
          type="number"
          name="price"
          placeholder="Price (₦)"
          value={form.price}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded mb-3"
        />

        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={form.phone}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded mb-3"
        />

        <label className="block mb-2 text-sm font-medium">Upload Photos (required)</label>
        <input
          type="file"
          name="photos"
          accept="image/*"
          onChange={handleFileChange}
          multiple
          required
          className="w-full mb-3"
        />

        <label className="block mb-2 text-sm font-medium">Upload Video Reel (optional)</label>
        <input
          type="file"
          name="video"
          accept="video/*"
          onChange={handleFileChange}
          className="w-full mb-4"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700"
        >
          Submit Product
        </button>
      </form>
    </div>
  );
}
