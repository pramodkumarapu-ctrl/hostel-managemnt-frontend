'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('yash@gmail.com');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // NOTE: Path must be '/users/login' to match your @Controller('users')
      const res = await api.post('/users/login', { email, password });

      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        router.replace('/'); 
      }
    } catch (err: any) {
      // Handles 401 (Forbidden) and Connection errors
      const message = err.response?.data?.message || "Check if Backend is running on Port 3000";
      setError(Array.isArray(message) ? message[0] : message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <form onSubmit={handleLogin} className="p-8 bg-slate-900 rounded-2xl border border-slate-800 w-96">
        <h2 className="text-xl font-bold mb-4 text-center">ADMIN LOGIN</h2>
        {error && <p className="text-red-500 text-xs mb-4 p-2 bg-red-500/10 rounded">{error}</p>}
        <input 
          className="w-full p-3 mb-3 bg-slate-800 rounded" 
          type="email" value={email} onChange={e => setEmail(e.target.value)} 
        />
        <input 
          className="w-full p-3 mb-6 bg-slate-800 rounded" 
          type="password" value={password} onChange={e => setPassword(e.target.value)} 
        />
        <button className="w-full bg-indigo-600 p-3 rounded font-bold hover:bg-indigo-500">LOGIN</button>
      </form>
    </div>
  );
}