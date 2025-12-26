'use client';

import { useEffect, useState } from 'react';
import { 
  LuReceipt, 
  LuPlus, 
  LuPencil, 
  LuTrash2, 
  LuX, 
  LuDownload, 
  LuCreditCard, 
  LuWallet, 
  LuBanknote,
  LuCalendar
} from "react-icons/lu";
import api from '../lib/api';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [residents, setResidents] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<any>(null);

  const [form, setForm] = useState({
    feeId: '',
    residentId: '',
    amount: '',
    method: 'CASH',
    paidAt: new Date().toISOString().split('T')[0],
  });

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = { Authorization: `Bearer ${token}` };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [payRes, residentRes, feeRes] = await Promise.all([
        api.get('/payments', { headers }),
        api.get('/residents', { headers }),
        api.get('/fees', { headers })
      ]);
      setPayments(Array.isArray(payRes.data) ? payRes.data : []);
      setResidents(Array.isArray(residentRes.data) ? residentRes.data : []);
      setFees(Array.isArray(feeRes.data) ? feeRes.data : []);
    } catch (error) {
      console.error("Fetch error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  /* ================= EXPORT TO CSV (XL COMPATIBLE) ================= */
  const downloadExcel = () => {
    const headers = ["ID,Resident,Fee Month,Amount,Method,Date"];
    const rows = payments.map(p => 
      `${p.id},${p.resident?.fullName},${p.fee?.month}/${p.fee?.year},${p.amount},${p.method},${new Date(p.paidAt).toLocaleDateString()}`
    );
    
    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Payments_Export_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const savePayment = async () => {
    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount.toString()),
        paidAt: new Date(form.paidAt).toISOString()
      };

      if (editingPayment) {
        await api.put(`/payments/${editingPayment.id}`, payload, { headers });
      } else {
        await api.post('/payments', payload, { headers });
      }
      closeModal();
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Error processing payment record.");
    }
  };

  const deletePayment = async (id: string) => {
    if (!confirm('Delete this transaction record?')) return;
    await api.delete(`/payments/${id}`, { headers });
    fetchData();
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingPayment(null);
  };

  // Filter fees belonging only to the selected resident
  const filteredFees = fees.filter(f => f.residentId === form.residentId);

  if (loading) return <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Syncing Transactions...</div>;

  return (
    <div className="p-4 lg:p-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <LuReceipt className="text-indigo-600" /> Payment History
          </h2>
          <p className="text-sm text-slate-500 font-medium">Record and export financial transactions</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={downloadExcel}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all"
          >
            <LuDownload size={16} /> Export XL
          </button>
          <button
            onClick={() => {
              setForm({ residentId: residents[0]?.id || '', feeId: '', amount: '', method: 'CASH', paidAt: new Date().toISOString().split('T')[0] });
              setModalOpen(true);
            }}
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-slate-800 transition-all"
          >
            <LuPlus size={18} /> New Payment
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Resident</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoice Period</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Method</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payments.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-900 text-sm">{p.resident?.fullName}</div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                    <LuCalendar size={10} /> {new Date(p.paidAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs font-semibold text-slate-600 italic">
                    Fee: Month {p.fee?.month}, {p.fee?.year}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-tight">
                    {p.method === 'CARD' ? <LuCreditCard size={12} /> : p.method === 'ONLINE' ? <LuWallet size={12} /> : <LuBanknote size={12} />}
                    {p.method}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="text-sm font-black text-indigo-600">${parseFloat(p.amount).toLocaleString()}</div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingPayment(p); setForm({...p, paidAt: p.paidAt.split('T')[0]}); setModalOpen(true); }} className="p-2 text-slate-400 hover:text-slate-900"><LuPencil size={16} /></button>
                    <button onClick={() => deletePayment(p.id)} className="p-2 text-slate-400 hover:text-red-600"><LuTrash2 size={16} /></button>
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
              <h3 className="font-black text-slate-900 tracking-tight">{editingPayment ? 'Edit Payment' : 'New Transaction'}</h3>
              <button onClick={closeModal} className="text-slate-300 hover:text-slate-900"><LuX size={20} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Resident</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none" value={form.residentId} onChange={e => setForm({...form, residentId: e.target.value, feeId: ''})}>
                  <option value="" disabled>Select payer...</option>
                  {residents.map(r => <option key={r.id} value={r.id}>{r.fullName}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Link to Fee Invoice</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none" value={form.feeId} onChange={e => setForm({...form, feeId: e.target.value})}>
                  <option value="">Select an invoice...</option>
                  {filteredFees.map(f => <option key={f.id} value={f.id}>Month {f.month}/{f.year} (${f.amount})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Amount Received</label>
                  <input type="number" step="0.01" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Payment Method</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none" value={form.method} onChange={e => setForm({...form, method: e.target.value})}>
                    <option value="CASH">Cash</option>
                    <option value="CARD">Card</option>
                    <option value="ONLINE">Online/UPI</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Transaction Date</label>
                <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none" value={form.paidAt} onChange={e => setForm({...form, paidAt: e.target.value})} />
              </div>
            </div>

            <div className="flex gap-2 mt-8">
              <button onClick={closeModal} className="flex-1 py-3 text-xs font-bold text-slate-400 hover:bg-slate-50 rounded-lg">Cancel</button>
              <button onClick={savePayment} className="flex-1 bg-slate-900 text-white py-3 text-xs font-bold rounded-lg hover:bg-slate-800 transition-all">
                {editingPayment ? 'Save Changes' : 'Record Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}