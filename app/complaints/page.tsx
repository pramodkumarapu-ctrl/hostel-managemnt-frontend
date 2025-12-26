'use client';

import { useEffect, useState } from 'react';
import { 
  LuMessageSquare, 
  LuPlus, 
  LuPencil, 
  LuTrash2, 
  LuX, 
  LuCircleCheck, 

  LuCircleSlash,
  LuCalendar,
  LuUser
} from "react-icons/lu";
import api from '../lib/api';

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [residents, setResidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingComplaint, setEditingComplaint] = useState<any>(null);

  const [form, setForm] = useState({
    residentId: '',
    title: '',
    description: '',
    status: 'PENDING',
  });

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = { Authorization: `Bearer ${token}` };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [compRes, resRes] = await Promise.all([
        api.get('/complaints', { headers }),
        api.get('/residents', { headers })
      ]);
      setComplaints(compRes.data || []);
      setResidents(resRes.data || []);
    } catch (error) {
      console.error("Fetch error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const saveComplaint = async () => {
    try {
      if (editingComplaint) {
        await api.put(`/complaints/${editingComplaint.id}`, form, { headers });
      } else {
        await api.post('/complaints', form, { headers });
      }
      closeModal();
      fetchData();
    } catch (error: any) {
      alert("Error saving complaint. Please ensure all fields are filled.");
    }
  };

  const deleteComplaint = async (id: string) => {
    if (!confirm('Permanently delete this complaint?')) return;
    await api.delete(`/complaints/${id}`, { headers });
    fetchData();
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingComplaint(null);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'RESOLVED': return 'bg-green-100 text-green-700';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700';
      default: return 'bg-rose-100 text-rose-700';
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-400 font-bold text-xs animate-pulse">LOADING GRIEVANCES...</div>;

  return (
    <div className="p-4 lg:p-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <LuMessageSquare className="text-indigo-600" /> Complaint Desk
          </h2>
          <p className="text-sm text-slate-500 font-medium">Manage and resolve resident issues</p>
        </div>
        <button
          onClick={() => {
            setForm({ residentId: residents[0]?.id || '', title: '', description: '', status: 'PENDING' });
            setModalOpen(true);
          }}
          className="bg-slate-900 text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-slate-800 transition-all flex items-center gap-2"
        >
          <LuPlus size={18} /> Log Complaint
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Resident</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Complaint Title</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {complaints.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-900 text-sm">{c.resident?.fullName}</div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5 font-medium">
                    <LuCalendar size={12} /> {new Date(c.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-semibold text-slate-700">{c.title}</div>
                  <div className="text-xs text-slate-400 line-clamp-1 max-w-xs">{c.description}</div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusStyle(c.status)}`}>
                    {c.status === 'RESOLVED' ? <LuCircleCheck size={12} /> : c.status === 'IN_PROGRESS' ? <LuLoader2 size={12} className="animate-spin" /> : <LuCircleSlash size={12} />}
                    {c.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingComplaint(c); setForm(c); setModalOpen(true); }} className="p-2 text-slate-400 hover:text-slate-900"><LuPencil size={16} /></button>
                    <button onClick={() => deleteComplaint(c.id)} className="p-2 text-slate-400 hover:text-red-600"><LuTrash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-slate-900 tracking-tight">{editingComplaint ? 'Update Status' : 'Register Complaint'}</h3>
              <button onClick={closeModal} className="text-slate-300 hover:text-slate-900"><LuX size={20} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Complainant</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none" value={form.residentId} onChange={e => setForm({...form, residentId: e.target.value})} disabled={!!editingComplaint}>
                  <option value="" disabled>Select resident...</option>
                  {residents.map(r => <option key={r.id} value={r.id}>{r.fullName}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Title</label>
                <input placeholder="Short summary (e.g. WiFi not working)" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm outline-none" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Detailed Description</label>
                <textarea placeholder="Describe the issue..." className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm outline-none h-24 resize-none" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Status</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                  <option value="PENDING">Pending Review</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-8">
              <button onClick={closeModal} className="flex-1 py-3 text-xs font-bold text-slate-400 hover:bg-slate-50 rounded-lg">Cancel</button>
              <button onClick={saveComplaint} className="flex-1 bg-slate-900 text-white py-3 text-xs font-bold rounded-lg hover:bg-slate-800 transition-all">
                {editingComplaint ? 'Update Record' : 'Submit Complaint'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
