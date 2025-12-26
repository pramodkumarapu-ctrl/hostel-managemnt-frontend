'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  FaEdit, FaTrash, FaPlus, FaTimes, FaBed,
  FaHashtag, FaBuilding, FaCheckCircle, FaExclamationTriangle, FaArrowLeft
} from 'react-icons/fa';
import api from '../lib/api';

export default function BedsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get IDs from URL for filtered view
  const filterRoomId = searchParams.get('roomId');
  const filterHostelId = searchParams.get('hostelId');

  const [beds, setBeds] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [hostels, setHostels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBed, setEditingBed] = useState<any>(null);

  const [form, setForm] = useState({
    bedNo: '',
    status: 'AVAILABLE',
    roomId: '',
    hostelId: '',
  });

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = { Authorization: `Bearer ${token}` };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resBeds, resRooms, resHostels] = await Promise.all([
        api.get('/beds', { headers }),
        api.get('/rooms', { headers }),
        api.get('/hostels', { headers }),
      ]);

      let bedData = resBeds.data || [];
      
      // APPLY FILTER IF IDs EXIST IN URL
      if (filterRoomId) {
        bedData = bedData.filter((b: any) => b.roomId === filterRoomId);
      } else if (filterHostelId) {
        bedData = bedData.filter((b: any) => b.hostelId === filterHostelId);
      }

      setBeds(bedData);
      setRooms(resRooms.data || []);
      setHostels(resHostels.data || []);

      // Auto-set form context based on URL
      if (filterHostelId || filterRoomId) {
        setForm(prev => ({
          ...prev,
          hostelId: filterHostelId || '',
          roomId: filterRoomId || ''
        }));
      }
    } catch (e) {
      console.error("Fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [filterRoomId, filterHostelId]);

  const filteredRooms = useMemo(() => {
    return rooms.filter(r => r.hostelId === form.hostelId);
  }, [form.hostelId, rooms]);

  const saveBed = async () => {
    try {
      if (!form.bedNo || !form.roomId || !form.hostelId)
        return alert('Please fill all fields!');

      if (editingBed) {
        await api.put(`/beds/${editingBed.id}`, form, { headers });
      } else {
        await api.post('/beds', form, { headers });
      }
      closeModal();
      fetchData();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Error saving bed!');
    }
  };

  const deleteBed = async (id: string) => {
    if (!confirm('Delete this bed?')) return;
    try {
      await api.delete(`/beds/${id}`, { headers });
      fetchData();
    } catch (e) {
      alert('Cannot delete bed. It may have a resident assigned.');
    }
  };

  const openAdd = () => {
    setForm({
      bedNo: '',
      status: 'AVAILABLE',
      hostelId: filterHostelId || hostels[0]?.id || '',
      roomId: filterRoomId || '',
    });
    setEditingBed(null);
    setModalOpen(true);
  };

  const openEdit = (bed: any) => {
    setEditingBed(bed);
    setForm({
      bedNo: bed.bedNo,
      status: bed.status,
      roomId: bed.roomId,
      hostelId: bed.hostelId,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingBed(null);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-4 md:p-10">
      <div className="max-w-6xl mx-auto">
        
        {/* BREADCRUMB / BACK */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest mb-6 transition-colors"
        >
          <FaArrowLeft /> Go Back
        </button>

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 flex items-center gap-4 tracking-tighter">
              <span className="bg-indigo-600 text-white p-4 rounded-3xl shadow-lg shadow-indigo-200">
                <FaBed size={24} />
              </span>
              {filterRoomId ? `ROOM ${rooms.find(r => r.id === filterRoomId)?.roomNo} BEDS` : 'BED ASSETS'}
            </h1>
            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] mt-2 ml-1">
              {filterRoomId ? 'Specific Room Inventory' : 'Full Property Inventory'}
            </p>
          </div>

          <button
            onClick={openAdd}
            className="bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl flex items-center gap-2"
          >
            <FaPlus /> Add New Bed
          </button>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {beds.length > 0 ? beds.map((b) => (
            <div key={b.id} className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm hover:shadow-xl transition-all duration-300 group">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${b.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white' : 'bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white'}`}>
                    <FaHashtag size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Bed No</p>
                    <p className="text-2xl font-black text-slate-900 leading-none">{b.bedNo}</p>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <button onClick={() => openEdit(b)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><FaEdit /></button>
                  <button onClick={() => deleteBed(b.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors"><FaTrash /></button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl">
                   <FaBuilding className="text-slate-300" />
                   <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">{b.hostel?.name} • Room {b.room?.roomNo}</span>
                </div>
                
                <div className={`flex items-center gap-2 p-3 rounded-xl font-black text-[10px] uppercase tracking-widest ${b.status === 'AVAILABLE' ? 'bg-emerald-50/50 text-emerald-600' : 'bg-rose-50/50 text-rose-600'}`}>
                   {b.status === 'AVAILABLE' ? <FaCheckCircle /> : <FaExclamationTriangle />}
                   {b.status}
                </div>
              </div>

              {b.resident && (
                <div className="mt-4 pt-4 border-t border-slate-50">
                   <p className="text-[10px] font-black text-indigo-600 uppercase mb-1">Current Occupant</p>
                   <p className="text-sm font-bold text-slate-800">{b.resident.fullName}</p>
                </div>
              )}
            </div>
          )) : (
            <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
               <FaBed className="mx-auto text-slate-200 mb-4" size={48} />
               <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No beds found for this selection</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black uppercase italic tracking-tight">{editingBed ? 'Update Bed' : 'Create Bed'}</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-900"><FaTimes size={20}/></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bed Identifier</label>
                <input
                  placeholder="e.g. B1, Window-Side"
                  value={form.bedNo}
                  onChange={(e) => setForm({ ...form, bedNo: e.target.value })}
                  className="w-full bg-slate-50 border-none rounded-xl px-4 py-4 font-bold outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hostel</label>
                  <select
                    disabled={!!filterHostelId}
                    value={form.hostelId}
                    onChange={(e) => setForm({ ...form, hostelId: e.target.value, roomId: '' })}
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-4 font-bold outline-none disabled:opacity-50"
                  >
                    <option value="">Select</option>
                    {hostels.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Room</label>
                  <select
                    disabled={!!filterRoomId || !form.hostelId}
                    value={form.roomId}
                    onChange={(e) => setForm({ ...form, roomId: e.target.value })}
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-4 font-bold outline-none disabled:opacity-50"
                  >
                    <option value="">Select</option>
                    {filteredRooms.map((r) => <option key={r.id} value={r.id}>{r.roomNo}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Availability Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full bg-slate-50 border-none rounded-xl px-4 py-4 font-bold outline-none"
                >
                  <option value="AVAILABLE">AVAILABLE</option>
                  <option value="OCCUPIED">OCCUPIED</option>
                  <option value="MAINTENANCE">MAINTENANCE</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8">
              <button onClick={closeModal} className="py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">Cancel</button>
              <button onClick={saveBed} className="py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">Save Bed</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}