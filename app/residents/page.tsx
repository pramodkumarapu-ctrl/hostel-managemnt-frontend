'use client';

import { useEffect, useState, useMemo } from 'react';
import { 
  LuUserPlus, LuTrash2, LuPencil, LuX, LuPhone, 
  LuMail, LuBed, LuShieldCheck, LuShieldAlert, LuSearch,
  LuArrowLeft
} from 'react-icons/lu';
import { useRouter } from 'next/navigation';
import api from '../lib/api';

export default function ResidentsPage() {
  const router = useRouter();
  const [residents, setResidents] = useState<any[]>([]);
  const [hostels, setHostels] = useState<any[]>([]);
  const [beds, setBeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<any>(null);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    hostelId: '',
    bedId: '',
    status: 'ACTIVE',
  });

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = { Authorization: `Bearer ${token}` };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resRes, hostelRes, bedRes] = await Promise.all([
        api.get('/residents', { headers }),
        api.get('/hostels', { headers }),
        api.get('/beds', { headers }),
      ]);
      setResidents(Array.isArray(resRes.data) ? resRes.data : []);
      setHostels(Array.isArray(hostelRes.data) ? hostelRes.data : []);
      setBeds(Array.isArray(bedRes.data) ? bedRes.data : []);
    } catch (error) {
      console.error("Fetch error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- CONNECTIVITY LOGIC ---
  // Filter beds based on selected hostel AND availability
  const availableBeds = useMemo(() => {
    return beds.filter(bed => {
      // Show bed if it belongs to selected hostel AND (is Available OR is already assigned to this resident)
      const isCorrectHostel = bed.hostelId === form.hostelId;
      const isAvailable = bed.status === 'AVAILABLE';
      const isCurrentlyAssignedToMe = editingResident && bed.id === editingResident.bedId;
      
      return isCorrectHostel && (isAvailable || isCurrentlyAssignedToMe);
    });
  }, [form.hostelId, beds, editingResident]);

  const openAdd = () => {
    setForm({ 
      fullName: '', 
      phone: '', 
      email: '', 
      hostelId: hostels[0]?.id || '', 
      bedId: '', 
      status: 'ACTIVE' 
    });
    setEditingResident(null);
    setModalOpen(true);
  };

  const openEdit = (resident: any) => {
    setEditingResident(resident);
    setForm({
      fullName: resident.fullName || '',
      phone: resident.phone || '',
      email: resident.email || '',
      hostelId: resident.hostelId || '',
      bedId: resident.bedId || '',
      status: resident.status || 'ACTIVE',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingResident(null);
  };

  const saveResident = async () => {
    if (!form.fullName || !form.phone || !form.hostelId) {
      return alert("Please fill Name, Phone, and Hostel");
    }
    try {
      if (editingResident) {
        await api.put(`/residents/${editingResident.id}`, form, { headers });
      } else {
        await api.post('/residents', form, { headers });
      }
      closeModal();
      fetchData(); // Refresh list and bed statuses
    } catch (error: any) {
      alert(error.response?.data?.message || "Error saving resident");
    }
  };

  const deleteResident = async (id: string) => {
    if (!confirm('Permanently delete this resident? The associated bed will become available.')) return;
    try {
      await api.delete(`/residents/${id}`, { headers });
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const filteredResidents = residents.filter(r => 
    r.fullName.toLowerCase().includes(search.toLowerCase()) ||
    r.phone.includes(search)
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-4 lg:p-10 bg-[#F8FAFC] min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
               RESIDENT DIRECTORY
            </h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Allocation & Occupancy Management</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
              <input 
                type="text" 
                placeholder="Search name or phone..." 
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 w-64 shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button 
              onClick={openAdd} 
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2 shrink-0"
            >
              <LuUserPlus size={14}/> Add New Resident
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Resident Details</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Info</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Placement</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredResidents.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-xs shadow-inner">
                          {r.fullName?.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-800 text-sm tracking-tight">{r.fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                          <LuPhone size={12} className="text-indigo-400"/> {r.phone}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
                          <LuMail size={12} className="text-slate-300"/> {r.email || 'No email provided'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <div className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
                          {r.hostel?.name || 'Unassigned'}
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase w-fit">
                          <LuBed size={12}/> {r.bed?.bedNo ? `Bed ${r.bed.bedNo}` : 'Waitlist'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] ${
                        r.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end items-center gap-1">
                        <button onClick={() => openEdit(r)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors hover:bg-indigo-50 rounded-lg"><LuPencil size={16}/></button>
                        <button onClick={() => deleteResident(r.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors hover:bg-rose-50 rounded-lg"><LuTrash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ALLOCATION MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="bg-slate-900 px-8 py-6 text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight">
                  {editingResident ? 'Edit Resident' : 'Add Resident'}
                </h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Resident & Bed Allocation</p>
              </div>
              <button onClick={closeModal} className="bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-colors">
                <LuX size={20} />
              </button>
            </div>

            <div className="p-8 space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <input 
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 mt-1 outline-none focus:border-indigo-500 transition-all" 
                  value={form.fullName} 
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                  <input className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 mt-1 outline-none focus:border-indigo-500 transition-all" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <input className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 mt-1 outline-none focus:border-indigo-500 transition-all" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Hostel</label>
                  <select 
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 mt-1 outline-none focus:border-indigo-500" 
                    value={form.hostelId} 
                    onChange={(e) => setForm({ ...form, hostelId: e.target.value, bedId: '' })}
                  >
                    <option value="">Select</option>
                    {hostels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Available Bed</label>
                  <select 
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 mt-1 outline-none focus:border-indigo-500 disabled:opacity-50" 
                    value={form.bedId} 
                    disabled={!form.hostelId}
                    onChange={(e) => setForm({ ...form, bedId: e.target.value })}
                  >
                    <option value="">Waitlist / No Bed</option>
                    {availableBeds.map(b => (
                      <option key={b.id} value={b.id}>{b.bedNo} ({b.room?.roomNo})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                <div className="flex gap-2 mt-1">
                  {['ACTIVE', 'LEFT'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm({...form, status: s})}
                      className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all ${
                        form.status === s ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={saveResident} 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 transition-all active:scale-95 mt-4"
              >
                {editingResident ? 'Update Resident Record' : 'Confirm Allocation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}