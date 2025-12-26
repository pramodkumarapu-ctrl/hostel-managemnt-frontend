'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Loader2 } from 'lucide-react';
import api from '../lib/api';

export default function UpdatePassword() {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // NOTE: Ensure your backend has this endpoint. 
      // It might be /auth/update-password or /users/change-password
      await api.post('/auth/update-password', { 
        email: 'yash@gmail.com', 
        password: newPassword 
      });

      alert("Password updated! Now login with your new password.");
      router.push('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || "Update failed. Check backend console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
      <div className="w-full max-w-md bg-slate-900 p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl">
        <div className="text-center mb-8">
          <ShieldCheck className="text-emerald-500 mx-auto mb-4" size={48} />
          <h1 className="text-white text-2xl font-black uppercase italic">Security Update</h1>
          <p className="text-slate-500 text-xs mt-2 uppercase tracking-widest">Update required for yash@gmail.com</p>
        </div>

        {error && <div className="mb-4 text-rose-400 text-xs font-bold bg-rose-500/10 p-4 rounded-xl border border-rose-500/20">{error}</div>}

        <form onSubmit={handleUpdate} className="space-y-4">
          <input 
            type="password" placeholder="Enter New Password" 
            className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-emerald-500"
            value={newPassword} onChange={e => setNewPassword(e.target.value)} required
          />
          <button 
            type="submit" disabled={loading}
            className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-xs hover:bg-emerald-500 transition-all"
          >
            {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Confirm New Password'}
          </button>
        </form>
      </div>
    </div>
  );
}