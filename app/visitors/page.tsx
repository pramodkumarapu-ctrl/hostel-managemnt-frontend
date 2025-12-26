'use client';

import { useEffect, useState } from 'react';
import { 
  LuUserCheck, LuPlus, LuTrash2, LuPencil, 
  LuX, LuClock, LuUser, LuLink, LuLogOut 
} from 'react-icons/lu';
import api from '../lib/api';

export default function VisitorsPage() {
  const [visitors, setVisitors] = useState<any[]>([]);
  const [residents, setResidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const [form, setForm] = useState({
    residentId: '',
    name: '',
    relation: '',
    inTime: '',
    outTime: '',
  });

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = { Authorization: `Bearer ${token}` };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [vRes, rRes] = await Promise.all([
        api.get('/visitors', { headers }),
        api.get('/residents', { headers }),
      ]);
      setVisitors(vRes.data || []);
      setResidents(rRes.data || []);
    } catch (e) {
      console.error("Error fetching data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const save = async () => {
    if (!form.residentId || !form.name || !form.inTime) {
      return alert('Resident, Name and In-Time are required');
    }

    try {
      const payload = {
        ...form,
        outTime: form.outTime || null
      };

      if (editing) {
        await api.put(`/visitors/${editing.id}`, payload, { headers });
      } else {
        await api.post('/visitors', payload, { headers });
      }
      close();
      fetchAll();
    } catch (e) {
      alert('Error saving visitor log');
    }
  };

  const quickCheckOut = async (id: string) => {
    try {
      const now = new Date().toISOString().slice(0, 16);
      await api.put(`/visitors/${id}`, { outTime: now }, { headers });
      fetchAll();
    } catch (e) {
      alert('Error recording check-out');
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this visitor log?')) return;
    try {
      await api.delete(`/visitors/${id}`, { headers });
      fetchAll();
    } catch (e) {
      alert("Error deleting log.");
    }
  };

  const openAdd = () => {
    setForm({ residentId: '', name: '', relation: '', inTime: new Date().toISOString().slice(0, 16), outTime: '' });
    setEditing(null);
    setOpen(true);
  };

  const openEdit = (v: any) => {
    setEditing(v);
    setForm({
      residentId: v.residentId,
      name: v.name,
      relation: v.relation || '',
      inTime: v.inTime ? v.inTime.slice(0, 16) : '',
      outTime: v.outTime ? v.outTime.slice(0, 16) : '',
    });
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    setEditing(null);
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
              <LuUserCheck className="text-indigo-600" /> VISITOR LOGS
            </h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Security & Access Management</p>
          </div>
          <button 
            onClick={openAdd} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2"
          >
            <LuPlus size={14}/> Record Entry
          </button>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Visitor / Relation</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Visiting Resident</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timings (In/Out)</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {visitors.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="font-bold text-slate-800 text-sm">{v.name}</div>
                      <div className="text-[10px] text-indigo-500 font-black uppercase tracking-tighter">{v.relation || 'Visitor'}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                        <LuUser size={12} className="text-slate-400" /> {v.resident?.fullName}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-[11px] font-bold text-slate-700">In: {new Date(v.inTime).toLocaleString()}</div>
                      <div className={`text-[11px] font-bold ${v.outTime ? 'text-slate-400' : 'text-amber-600 italic'}`}>
                        Out: {v.outTime ? new Date(v.outTime).toLocaleString() : 'Currently Inside'}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end items-center gap-1">
                        {!v.outTime && (
                          <button 
                            onClick={() => quickCheckOut(v.id)} 
                            title="Check Out Now"
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <LuLogOut size={16}/>
                          </button>
                        )}
                        <button onClick={() => openEdit(v)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><LuPencil size={16}/></button>
                        <button onClick={() => remove(v.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors"><LuTrash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ================= COMPACT MODAL ================= */}
      {open && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="bg-indigo-600 px-6 py-4 text-white flex justify-between items-center">
              <h2 className="text-lg font-black uppercase tracking-tight">{editing ? 'Edit Log' : 'Entry Check-in'}</h2>
              <button onClick={close} className="hover:bg-white/20 p-1.5 rounded-full transition-colors"><LuX size={18} /></button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Resident Visiting</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 mt-1 outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.residentId}
                  onChange={(e) => setForm({ ...form, residentId: e.target.value })}
                >
                  <option value="">Select Resident</option>
                  {residents.map((r) => <option key={r.id} value={r.id}>{r.fullName}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Visitor Name</label>
                  <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 mt-1 outline-none focus:ring-2 focus:ring-indigo-500" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Relation</label>
                  <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 mt-1 outline-none focus:ring-2 focus:ring-indigo-500" value={form.relation} onChange={(e) => setForm({ ...form, relation: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">In-Time</label>
                  <input type="datetime-local" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-900 mt-1 outline-none focus:ring-2 focus:ring-indigo-500" value={form.inTime} onChange={(e) => setForm({ ...form, inTime: e.target.value })} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Out-Time</label>
                  <input type="datetime-local" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-900 mt-1 outline-none focus:ring-2 focus:ring-indigo-500" value={form.outTime} onChange={(e) => setForm({ ...form, outTime: e.target.value })} />
                </div>
              </div>

              <button 
                onClick={save} 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-indigo-100 transition-all active:scale-95 mt-2"
              >
                {editing ? 'Update Record' : 'Log Entry'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}