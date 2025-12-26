'use client';

import { useEffect, useState } from 'react';
import {
  LuHotel,
  LuPlus,
  LuPencil,
  LuTrash2,
  LuMapPin,
  LuPhone,
  LuX,
  LuLayoutGrid // Icon for managing floors
} from 'react-icons/lu';
import { useRouter } from 'next/navigation';
import api from '../lib/api';

export default function HostelsPage() {
  const [hostels, setHostels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
  });

  const router = useRouter();
  const headers = { Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') : ''}` };

  const loadHostels = async () => {
    try {
      const res = await api.get('/hostels', { headers });
      setHostels(res.data || []);
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadHostels(); }, []);

  const saveHostel = async () => {
    if (!form.name || !form.address) return alert('Name and Address are required');
    try {
      setSaving(true);
      if (editing) {
        await api.put(`/hostels/${editing.id}`, form, { headers });
      } else {
        await api.post('/hostels', form, { headers });
      }
      setOpen(false);
      setEditing(null);
      setForm({ name: '', address: '', phone: '' });
      loadHostels();
    } catch {
      alert('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const deleteHostel = async (id: string) => {
    if (!confirm('Delete this hostel? This will affect all associated floors and rooms.')) return;
    try {
      await api.delete(`/hostels/${id}`, { headers });
      setHostels(prev => prev.filter(h => h.id !== id));
    } catch {
      alert('Delete failed');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-4 lg:p-10 bg-[#F8FAFC] min-h-screen">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <LuHotel className="text-indigo-600" /> HOSTELS
              <span className="bg-indigo-100 text-indigo-600 text-[10px] px-2 py-0.5 rounded-md font-black">
                {hostels.length} UNITS
              </span>
            </h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Property Management</p>
          </div>
          <button 
            onClick={() => { setForm({ name: '', address: '', phone: '' }); setEditing(null); setOpen(true); }} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2"
          >
            <LuPlus size={14}/> Add Hostel
          </button>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Property Name</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {hostels.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="font-bold text-slate-800 text-sm">{h.name}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                        <LuMapPin size={12} className="text-slate-400" /> {h.address}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                        <LuPhone size={12} className="text-slate-400" /> {h.phone || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end items-center gap-2">
                        {/* CONNECTING BUTTON: GO TO FLOORS */}
                        <button 
                          onClick={() => router.push(`/floors?hostelId=${h.id}`)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase hover:bg-indigo-100 transition-colors"
                        >
                          <LuLayoutGrid size={14}/> Floors
                        </button>

                        <button 
                          onClick={() => { setEditing(h); setForm({name: h.name, address: h.address, phone: h.phone}); setOpen(true); }} 
                          className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                          <LuPencil size={16}/>
                        </button>
                        <button 
                          onClick={() => deleteHostel(h.id)} 
                          className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <LuTrash2 size={16}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL (Unchanged but ensuring form cleanup) */}
      {open && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden">
            <div className="bg-indigo-600 px-6 py-4 text-white flex justify-between items-center">
              <h2 className="text-lg font-black uppercase tracking-tight">{editing ? 'Edit Hostel' : 'New Hostel'}</h2>
              <button onClick={() => setOpen(false)} className="hover:bg-white/20 p-1.5 rounded-full"><LuX size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hostel Name</label>
                <input className="w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm font-bold mt-1 outline-none focus:ring-2 focus:ring-indigo-500" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Address</label>
                <input className="w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm font-bold mt-1 outline-none focus:ring-2 focus:ring-indigo-500" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</label>
                <input className="w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm font-bold mt-1 outline-none focus:ring-2 focus:ring-indigo-500" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <button onClick={saveHostel} disabled={saving} className="w-full bg-indigo-600 text-white py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest active:scale-95 disabled:opacity-50">
                {saving ? 'Processing...' : editing ? 'Update Property' : 'Register Hostel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}