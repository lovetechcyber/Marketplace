import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { token } = router.query;

  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [show, setShow] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      await axios.post(`/api/auth/reset-password/${token}`, { password: form.password });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-full max-w-sm">
        <h2 className="text-xl font-semibold mb-4">Reset Password</h2>

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        {success && <p className="text-green-600 text-sm mb-2">Password reset successful!</p>}

        <div className="relative mb-3">
          <input
            type={show ? 'text' : 'password'}
            name="password"
            placeholder="New Password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div className="relative mb-3">
          <input
            type={show ? 'text' : 'password'}
            name="confirmPassword"
            placeholder="Confirm New Password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
          <span
            onClick={() => setShow(!show)}
            className="absolute right-3 top-2.5 cursor-pointer text-gray-500 text-sm"
          >
            {show ? 'Hide' : 'Show'}
          </span>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700"
        >
          Reset Password
        </button>
      </form>
    </div>
  );
}
