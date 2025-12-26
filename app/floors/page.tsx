'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaTimes,
  FaLayerGroup,
  FaHotel,
  FaHashtag,
  FaArrowLeft
} from 'react-icons/fa';
import api from '../lib/api';

export default function FloorsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get hostelId from URL (e.g., /floors?hostelId=123)
  const filterHostelId = searchParams.get('hostelId');

  const [floors, setFloors] = useState<any[]>([]);
  const [hostels, setHostels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFloor, setEditingFloor] = useState<any>(null);

  const [form, setForm] = useState({
    number: '',
    hostelId: '',
  });

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = { Authorization: `Bearer ${token}` };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [floorRes, hostelRes] = await Promise.all([
        api.get('/floors', { headers }),
        api.get('/hostels', { headers }),
      ]);
      
      let floorData = Array.isArray(floorRes.data) ? floorRes.data : [];
      
      // APPLY FILTER IF HOSTEL ID EXISTS IN URL
      if (filterHostelId) {
        floorData = floorData.filter((f: any) => f.hostelId === filterHostelId);
      }

      setFloors(floorData);
      setHostels(Array.isArray(hostelRes.data) ? hostelRes.data : []);
      
      // Auto-set the hostel in the form if we are filtered
      if (filterHostelId) {
        setForm(prev => ({ ...prev, hostelId: filterHostelId }));
      }
    } catch (error) {
      console.error('Fetch error', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [filterHostelId]);

  const saveFloor = async () => {
    const payload = {
      number: Number(form.number),
      hostelId: form.hostelId,
    };
    try {
      if (editingFloor) {
        await api.put(`/floors/${editingFloor.id}`, payload, { headers });
      } else {
        await api.post('/floors', payload, { headers });
      }
      closeModal();
      fetchData();
    } catch (err) {
      alert("Error saving floor. Check if floor number already exists for this hostel.");
    }
  };

  const deleteFloor = async (id: string) => {
    if (!confirm('Delete this floor?')) return;
    await api.delete(`/floors/${id}`, { headers });
    fetchData();
  };

  const openAdd = () => {
    setForm({ 
      number: '', 
      hostelId: filterHostelId || hostels[0]?.id || '' 
    });
    setEditingFloor(null);
    setModalOpen(true);
  };

  const openEdit = (floor: any) => {
    setEditingFloor(floor);
    setForm({
      number: floor.number.toString(),
      hostelId: floor.hostelId,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingFloor(null);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="max-w-6xl mx-auto mb-6">
         {/* BACK BUTTON */}
         <button 
          onClick={() => router.push('/hostels')}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-sm transition-colors mb-4"
         >
           <FaArrowLeft size={12}/> Back to Hostels
         </button>
      </div>

      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <span className="bg-indigo-600 text-white p-3 rounded-2xl shadow-lg">
              <FaLayerGroup />
            </span>
            {filterHostelId 
              ? `${hostels.find(h => h.id === filterHostelId)?.name || 'Hostel'} Floors` 
              : 'All Floors'}
          </h1>
          <div className="flex items-center gap-3 mt-3">
            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">
              Count: {floors.length}
            </span>
          </div>
        </div>

        <button onClick={openAdd} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg active:scale-95 transition">
          <FaPlus size={12} /> Add Floor
        </button>
      </div>

      {/* FLOOR CARDS */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {floors.map((f) => (
          <div key={f.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition">
            <div className="flex justify-between mb-6">
              <div className="bg-indigo-50 text-indigo-600 p-3 rounded-2xl"><FaHashtag /></div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(f)} className="p-2 rounded-lg border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 transition"><FaEdit size={14} /></button>
                <button onClick={() => deleteFloor(f.id)} className="p-2 rounded-lg border border-slate-200 hover:bg-red-50 hover:text-red-500 transition"><FaTrash size={14} /></button>
              </div>
            </div>
            <h2 className="text-2xl font-black text-slate-800">Floor {f.number}</h2>
            <div className="flex items-center gap-2 text-slate-500 text-sm mt-2">
              <FaHotel className="text-indigo-400" /> {f.hostel?.name || 'View Hostel'}
            </div>
            {/* LINK TO ROOMS (Placeholder for your next step) */}
            <button 
              onClick={() => router.push(`/rooms?floorId=${f.id}`)}
              className="mt-6 w-full py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all"
            >
              View Rooms ({f.rooms?.length || 0})
            </button>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-extrabold text-slate-900">{editingFloor ? 'Edit Floor' : 'Create Floor'}</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-black"><FaTimes size={22} /></button>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Floor Number</label>
                <div className="relative">
                  <FaHashtag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="number" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-300 focus:border-indigo-600 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Hostel</label>
                <div className="relative">
                  <FaHotel className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select 
                    disabled={!!filterHostelId && !editingFloor}
                    value={form.hostelId} 
                    onChange={(e) => setForm({ ...form, hostelId: e.target.value })} 
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-300 focus:border-indigo-600 outline-none appearance-none"
                  >
                    <option value="">Select Hostel</option>
                    {hostels.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-10">
              <button onClick={closeModal} className="py-3 rounded-xl border-2 border-slate-300 font-bold text-slate-600 hover:bg-slate-100 transition">Cancel</button>
              <button onClick={saveFloor} className="py-3 rounded-xl bg-indigo-600 text-white font-bold shadow-lg active:scale-95 transition">{editingFloor ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}