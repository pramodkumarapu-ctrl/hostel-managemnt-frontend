'use client';

import { useEffect, useState } from 'react';
// ✅ ADDED LuAlertCircle to the import list below
import { 
  LuDollarSign, 
  LuPlus, 
  LuPencil, 
  LuTrash2, 
  LuX, 
  LuCalendarDays, 
  LuCircleCheck, 
  LuHistory,
  LuLoaderCircle,
 

} from "react-icons/lu";
import api from '../lib/api';

export default function FeesPage() {
  const [fees, setFees] = useState<any[]>([]);
  const [residents, setResidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<any>(null);

  const [form, setForm] = useState({
    residentId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    amount: '',
    status: 'UNPAID',
  });

  // Dynamic headers helper to ensure token is always fresh
  const getHeaders = () => ({
    Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') : ''}`,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [feeRes, residentRes] = await Promise.all([
        api.get('/fees', { headers: getHeaders() }),
        api.get('/residents', { headers: getHeaders() })
      ]);
      setFees(feeRes.data || []);
      setResidents(residentRes.data || []);
    } catch (error) {
      console.error("Fetch error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const saveFee = async () => {
    if (!form.residentId || !form.amount) return alert("Fill Resident and Amount");
    try {
      const payload = {
        ...form,
        month: Number(form.month),
        year: Number(form.year),
        amount: Number(form.amount)
      };

      if (editingFee) {
        await api.put(`/fees/${editingFee.id}`, payload, { headers: getHeaders() });
      } else {
        await api.post('/fees', payload, { headers: getHeaders() });
      }
      closeModal();
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Record exists for this period.");
    }
  };

  const toggleStatus = async (fee: any) => {
    const newStatus = fee.status === 'PAID' ? 'UNPAID' : 'PAID';
    try {
      await api.put(`/fees/${fee.id}`, { ...fee, status: newStatus }, { headers: getHeaders() });
      fetchData();
    } catch (e) {
      alert("Update failed.");
    }
  };

  const deleteFee = async (id: string) => {
    if (!confirm('Delete record?')) return;
    try {
      await api.delete(`/fees/${id}`, { headers: getHeaders() });
      fetchData();
    } catch (error) {
      alert("Delete failed.");
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingFee(null);
    setForm({ 
      residentId: '', 
      month: new Date().getMonth() + 1, 
      year: new Date().getFullYear(), 
      amount: '', 
      status: 'UNPAID' 
    });
  };

  const totalUnpaid = fees
    .filter(f => f.status !== 'PAID')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-2">
      <LuLoaderCircle className="w-8 h-8 text-indigo-600 animate-spin" />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Syncing Ledger</p>
    </div>
  );

  return (
    <div className="p-4 lg:p-10 bg-[#F8FAFC] min-h-screen">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 uppercase">
              <LuDollarSign className="text-emerald-600" /> Fee Ledger
            </h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Financial Records</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-amber-50 border border-amber-100 px-4 py-2 rounded-xl flex items-center gap-3">
              <LuLoaderCircle className="text-amber-600" size={18} />
              <div>
                <p className="text-[9px] font-black text-amber-500 uppercase tracking-tighter leading-none">Pending</p>
                <p className="text-sm font-black text-amber-700">₹{totalUnpaid.toLocaleString()}</p>
              </div>
            </div>
            <button 
              onClick={() => setModalOpen(true)} 
              className="bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2"
            >
              <LuPlus size={14}/> Create Invoice
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Resident</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cycle</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {fees.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5 font-bold text-slate-800 text-sm">
                      {f.resident?.fullName || 'N/A'}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 uppercase">
                        <LuCalendarDays size={12} className="text-slate-400" />
                        {new Date(0, f.month - 1).toLocaleString('default', { month: 'short' })} {f.year}
                      </div>
                    </td>
                    <td className="px-6 py-5 font-black text-slate-900 text-sm">
                      ₹{(Number(f.amount) || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <button 
                        onClick={() => toggleStatus(f)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                          f.status === 'PAID' 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                            : 'bg-rose-50 text-rose-600 border-rose-100'
                        }`}
                      >
                        {f.status === 'PAID' ? <LuCircleCheck size={11} /> : <LuHistory size={11} />}
                        {f.status}
                      </button>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end items-center gap-1">
                        <button onClick={() => { 
                          setEditingFee(f); 
                          setForm({ residentId: f.residentId, month: f.month, year: f.year, amount: f.amount.toString(), status: f.status }); 
                          setModalOpen(true); 
                        }} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                          <LuPencil size={16}/>
                        </button>
                        <button onClick={() => deleteFee(f.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors">
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

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden">
            <div className="bg-slate-900 px-6 py-4 text-white flex justify-between items-center">
              <h2 className="text-lg font-black uppercase tracking-tight">{editingFee ? 'Edit Invoice' : 'New Invoice'}</h2>
              <button onClick={closeModal} className="hover:bg-white/20 p-1.5 rounded-full transition-colors"><LuX size={18} /></button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Resident</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 mt-1 outline-none" value={form.residentId} onChange={e => setForm({...form, residentId: e.target.value})} disabled={!!editingFee}>
                  <option value="">Choose Resident</option>
                  {residents.map(r => <option key={r.id} value={r.id}>{r.fullName}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Month" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold mt-1 outline-none" value={form.month} onChange={e => setForm({...form, month: Number(e.target.value)})} />
                <input type="number" placeholder="Year" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold mt-1 outline-none" value={form.year} onChange={e => setForm({...form, year: Number(e.target.value)})} />
              </div>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                <input type="number" placeholder="Amount" className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-2.5 text-sm font-bold mt-1 outline-none" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
              </div>

              <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold mt-1 outline-none" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                <option value="UNPAID">Unpaid</option>
                <option value="PAID">Paid</option>
              </select>

              <button onClick={saveFee} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-emerald-100 transition-all active:scale-95 mt-2">
                {editingFee ? 'Save Changes' : 'Confirm Invoice'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}