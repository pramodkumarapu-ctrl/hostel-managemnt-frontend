'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('owner1@gmail.com');
  const [password, setPassword] = useState('Owner@123');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await api.post('/users/login', {
        email,
        password,
      });

      // ✅ Save token
      localStorage.setItem('token', res.data.token);

      // ✅ Save user info
      localStorage.setItem('user', JSON.stringify(res.data.user));

      // ✅ Redirect to dashboard/users
      router.replace('/users');
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        'Backend not reachable. Please try again.';
      setError(Array.isArray(message) ? message[0] : message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <form
        onSubmit={handleLogin}
        className="p-8 bg-slate-900 rounded-2xl border border-slate-800 w-96"
      >
        <h2 className="text-xl font-bold mb-4 text-center">ADMIN LOGIN</h2>

        {error && (
          <p className="text-red-500 text-xs mb-4 p-2 bg-red-500/10 rounded">
            {error}
          </p>
        )}

        <input
          className="w-full p-3 mb-3 bg-slate-800 rounded"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />

        <input
          className="w-full p-3 mb-6 bg-slate-800 rounded"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />

        <button className="w-full bg-indigo-600 p-3 rounded font-bold hover:bg-indigo-500">
          LOGIN
        </button>
      </form>
    </div>
  );
}
