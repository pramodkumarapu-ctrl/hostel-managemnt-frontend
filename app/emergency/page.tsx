'use client';

import { useEffect, useState } from 'react';
import { 
  LuPhone, 
  LuPlus, 
  LuTrash2, 
  LuPencil, 
  LuUser, 
  LuHeart, 
  LuSearch, 
  LuX,

  LuLoaderCircle, 
  LuPhoneCall    
} from "react-icons/lu";
import api from '../lib/api';

export default function EmergencyPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [residents, setResidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    residentId: '',
    name: '',
    phone: '',
    relation: '',
  });

  const getHeaders = () => ({
    Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') : ''}`,
  });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [c, r] = await Promise.all([
        api.get('/emergency', { headers: getHeaders() }),
        api.get('/residents', { headers: getHeaders() }),
      ]);
      setContacts(c.data || []);
      setResidents(r.data || []);
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const submit = async () => {
    if (!form.residentId || !form.name || !form.phone) return alert("Please fill all required fields");
    try {
      if (editingId) {
        await api.put(`/emergency/${editingId}`, form, { headers: getHeaders() });
      } else {
        await api.post('/emergency', form, { headers: getHeaders() });
      }
      setForm({ residentId: '', name: '', phone: '', relation: '' });
      setEditingId(null);
      fetchAll();
    } catch (err) {
      alert("Action failed. Please try again.");
    }
  };

  const handleEdit = (c: any) => {
    setEditingId(c.id);
    setForm({
      residentId: c.residentId,
      name: c.name,
      phone: c.phone,
      relation: c.relation,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;
    try {
      await api.delete(`/emergency/${id}`, { headers: getHeaders() });
      fetchAll();
    } catch (err) {
      alert("Delete failed.");
    }
  };

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.resident?.fullName || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
      <LuLoaderCircle className="w-12 h-12 text-red-600 animate-spin" />
      <p className="text-sm font-bold text-slate-900 uppercase tracking-widest">Securing Safety Data...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-10 text-slate-900">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-red-600 p-2.5 rounded-xl shadow-lg shadow-red-200">
                <LuLoaderCircle className="text-white w-6 h-6" />
              </div>
              <h1 className="text-4xl font-black tracking-tighter text-slate-900">
                EMERGENCY <span className="text-red-600">CONTACTS</span>
              </h1>
            </div>
            <p className="text-sm font-bold text-slate-500 ml-1">Immediate response directory for all hostel residents.</p>
          </div>

          <div className="relative">
            <LuSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-900 w-5 h-5 z-10" />
            <input 
              type="text" 
              placeholder="Search by Resident or Contact Name..." 
              className="pl-12 pr-6 py-4 bg-white border-2 border-slate-200 rounded-2xl w-full md:w-96 shadow-xl focus:border-red-600 focus:ring-0 transition-all text-slate-900 font-bold placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* INPUT FORM CARD - High Visibility */}
        <div className="bg-white rounded-[2.5rem] border-2 border-slate-900 p-8 mb-12 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
            <h2 className="font-black text-slate-900 uppercase tracking-widest text-sm">
              {editingId ? 'Modify Safety Record' : 'Register New Emergency Contact'}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
            <div className="space-y-1">
               <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Resident Name</label>
               <select 
                className="w-full h-14 bg-slate-100 border-2 border-slate-200 rounded-xl px-4 text-sm font-black text-slate-900 outline-none focus:border-red-600 focus:bg-white transition-all"
                value={form.residentId}
                onChange={e => setForm({ ...form, residentId: e.target.value })}
                disabled={!!editingId}
              >
                <option value="">Select Resident</option>
                {residents.map(r => <option key={r.id} value={r.id}>{r.fullName}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Contact Name</label>
              <input className="w-full h-14 bg-slate-100 border-2 border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-900 outline-none focus:border-red-600 focus:bg-white" placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Phone Number</label>
              <input className="w-full h-14 bg-slate-100 border-2 border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-900 outline-none focus:border-red-600 focus:bg-white" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Relation</label>
              <input className="w-full h-14 bg-slate-100 border-2 border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-900 outline-none focus:border-red-600 focus:bg-white" placeholder="Parent / Guardian" value={form.relation} onChange={e => setForm({ ...form, relation: e.target.value })} />
            </div>

            <div className="flex items-end gap-2">
              <button 
                onClick={submit}
                className={`flex-1 h-14 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg ${editingId ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200' : 'bg-red-600 text-white hover:bg-red-700 shadow-red-200'}`}
              >
                {editingId ? <LuPencil size={18}/> : <LuPlus size={18}/>}
                {editingId ? 'Update' : 'Register'}
              </button>
              {editingId && (
                <button 
                  onClick={() => { setEditingId(null); setForm({ residentId: '', name: '', phone: '', relation: '' }); }}
                  className="w-14 h-14 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-black transition-all"
                >
                  <LuX size={24} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* CARDS GRID - Bold Design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredContacts.map(c => (
            <div key={c.id} className="bg-white rounded-[2rem] border-2 border-slate-200 p-8 hover:border-red-600 hover:shadow-2xl transition-all group relative overflow-hidden">
              {/* Emergency Stripe */}
              <div className="absolute top-0 left-0 w-full h-2 bg-red-600" />
              
              <div className="flex items-start justify-between mb-8">
                <div className="bg-slate-900 p-4 rounded-2xl rotate-3 group-hover:rotate-0 transition-transform shadow-lg">
                  <LuPhoneCall className="text-white w-6 h-6" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(c)} className="p-2 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><LuPencil size={20}/></button>
                  <button onClick={() => remove(c.id)} className="p-2 bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><LuTrash2 size={20}/></button>
                </div>
              </div>

              <h2 className="text-2xl font-black text-slate-900 mb-1 tracking-tight group-hover:text-red-600 transition-colors">{c.name}</h2>
              <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 border border-red-100">
                <LuHeart size={12}/> {c.relation || 'Direct Contact'}
              </div>

              <div className="space-y-5 pt-6 border-t-2 border-dashed border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-md">
                    <LuUser className="text-white" size={18}/>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Resident Linked</p>
                    <p className="text-sm font-black text-slate-900">{c.resident?.fullName || 'N/A'}</p>
                  </div>
                </div>
                
                <a 
                  href={`tel:${c.phone}`} 
                  className="flex items-center gap-4 group/phone"
                >
                  <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center shadow-md group-hover/phone:scale-110 transition-transform">
                    <LuPhone className="text-white" size={18}/>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Contact Number</p>
                    <p className="text-lg font-black text-slate-900 tracking-tight group-hover/phone:text-green-600 transition-colors">{c.phone}</p>
                  </div>
                </a>
              </div>
            </div>
          ))}
        </div>

        {filteredContacts.length === 0 && (
          <div className="text-center py-32 bg-white rounded-[3rem] border-4 border-dashed border-slate-200 shadow-inner">
            <LuSearch className="mx-auto text-slate-200 mb-6" size={80} />
            <h3 className="text-2xl font-black text-slate-900 uppercase">No Contacts Found</h3>
            <p className="text-slate-500 font-bold mt-2">Adjust your search to find the safety record.</p>
          </div>
        )}
      </div>
    </div>
  );
}