'use client';

import { useEffect, useState } from 'react';
import {
  LuPlus, LuTrash2, LuPencil, LuX, LuCalendar, 
  LuCheck, LuBan, LuInfo, LuArrowRight 
} from 'react-icons/lu';
import api from '../lib/api';

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [residents, setResidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<any>(null);

  const [form, setForm] = useState({
    residentId: '',
    fromDate: '',
    toDate: '',
    reason: '',
    status: 'PENDING',
  });

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = { Authorization: `Bearer ${token}` };

  /* ================= FETCH DATA ================= */
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [leaveRes, residentRes] = await Promise.all([
        api.get('/leaves', { headers }),
        api.get('/residents', { headers }),
      ]);
      setLeaves(leaveRes.data || []);
      setResidents(residentRes.data || []);
    } catch (e) {
      console.error("Error fetching data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  /* ================= QUICK ACTIONS ================= */
  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await api.put(`/leaves/${id}`, { status: newStatus }, { headers });
      fetchAll();
    } catch (e) {
      alert("Failed to update status");
    }
  };

  /* ================= SAVE / DELETE ================= */
  const save = async () => {
    if (!form.residentId || !form.fromDate || !form.toDate) {
      return alert('Please fill required dates and select a resident.');
    }
    try {
      if (edit) {
        await api.put(`/leaves/${edit.id}`, form, { headers });
      } else {
        await api.post('/leaves', form, { headers });
      }
      close();
      fetchAll();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Error saving leave');
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Permanently delete this leave record?')) return;
    try {
      await api.delete(`/leaves/${id}`, { headers });
      fetchAll();
    } catch (e) {
      alert("Error deleting record.");
    }
  };

  /* ================= HELPERS ================= */
  const openAdd = () => {
    setForm({
      residentId: residents[0]?.id || '',
      fromDate: '',
      toDate: '',
      reason: '',
      status: 'PENDING',
    });
    setEdit(null);
    setOpen(true);
  };

  const openEdit = (l: any) => {
    setEdit(l);
    setForm({
      residentId: l.residentId,
      fromDate: l.fromDate?.substring(0, 10),
      toDate: l.toDate?.substring(0, 10),
      reason: l.reason,
      status: l.status,
    });
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    setEdit(null);
  };

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    const d1 = new Date(start);
    const d2 = new Date(end);
    const diff = d2.getTime() - d1.getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24)) + 1;
    return days > 0 ? days : 0;
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
              LEAVE REQUESTS
              <span className="bg-indigo-100 text-indigo-600 text-[10px] px-2 py-0.5 rounded-md font-black">
                {leaves.length} TOTAL
              </span>
            </h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Attendance Management</p>
          </div>
          <button 
            onClick={openAdd} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2"
          >
            <LuPlus size={14}/> New Request
          </button>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Resident</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {leaves.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="font-bold text-slate-800 text-sm">{l.resident?.fullName}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">ID: {l.residentId.substring(0,8)}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                        {l.fromDate?.substring(0, 10)} 
                        <LuArrowRight className="text-slate-300" size={12}/>
                        {l.toDate?.substring(0, 10)}
                      </div>
                      <span className="text-[9px] font-black text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded uppercase mt-1 inline-block">
                        {calculateDays(l.fromDate, l.toDate)} Days
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        l.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : 
                        l.status === 'REJECTED' ? 'bg-rose-50 text-rose-600' : 
                        'bg-amber-50 text-amber-600'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end items-center gap-1">
                        {l.status === 'PENDING' && (
                          <>
                            <button onClick={() => updateStatus(l.id, 'APPROVED')} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><LuCheck size={16}/></button>
                            <button onClick={() => updateStatus(l.id, 'REJECTED')} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><LuBan size={16}/></button>
                          </>
                        )}
                        <button onClick={() => openEdit(l)} className="p-1.5 text-slate-400 hover:text-indigo-600"><LuPencil size={16}/></button>
                        <button onClick={() => remove(l.id)} className="p-1.5 text-slate-400 hover:text-rose-600"><LuTrash2 size={16}/></button>
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
              <h2 className="text-lg font-black uppercase tracking-tight">{edit ? 'Edit Leave' : 'New Leave'}</h2>
              <button onClick={close} className="hover:bg-white/20 p-1.5 rounded-full transition-colors"><LuX size={18} /></button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Resident</label>
                <select 
                  disabled={!!edit}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={form.residentId}
                  onChange={(e) => setForm({ ...form, residentId: e.target.value })}
                >
                  <option value="">Select Resident</option>
                  {residents.map((r) => <option key={r.id} value={r.id}>{r.fullName}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">From Date</label>
                  <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 mt-1 outline-none" value={form.fromDate} onChange={(e) => setForm({ ...form, fromDate: e.target.value })} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">To Date</label>
                  <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 mt-1 outline-none" value={form.toDate} onChange={(e) => setForm({ ...form, toDate: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason</label>
                <textarea rows={2} placeholder="Reason for leave..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 mt-1 outline-none" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 mt-1 outline-none" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="PENDING">Pending Review</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              <button onClick={save} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-indigo-100 transition-all active:scale-95 mt-2">
                {edit ? 'Update Leave Record' : 'Submit Leave Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}