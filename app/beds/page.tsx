'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  FaEdit, FaTrash, FaPlus, FaTimes, FaBed,
  FaHashtag, FaBuilding, FaCheckCircle, FaExclamationTriangle, FaArrowLeft, FaSearch
} from 'react-icons/fa';
import api from '../lib/api';

export default function BedsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get filter context from URL
  const filterRoomId = searchParams.get('roomId');
  const filterHostelId = searchParams.get('hostelId');

  const [beds, setBeds] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [hostels, setHostels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBed, setEditingBed] = useState<any>(null);
  const [search, setSearch] = useState('');

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

      setBeds(resBeds.data || []);
      setRooms(resRooms.data || []);
      setHostels(resHostels.data || []);
    } catch (e) {
      console.error("Fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Filter beds based on URL params (Room/Hostel) and Search text
  const filteredBeds = useMemo(() => {
    return beds.filter(b => {
      const matchesRoom = filterRoomId ? b.roomId === filterRoomId : true;
      const matchesHostel = filterHostelId ? b.hostelId === filterHostelId : true;
      const matchesSearch = b.bedNo.toLowerCase().includes(search.toLowerCase());
      return matchesRoom && matchesHostel && matchesSearch;
    });
  }, [beds, filterRoomId, filterHostelId, search]);

  // Only show rooms belonging to the selected hostel in the Modal
  const [form, setForm] = useState({ bedNo: '', status: 'AVAILABLE', roomId: '', hostelId: '' });
  
  const modalFilteredRooms = useMemo(() => {
    return rooms.filter(r => r.hostelId === form.hostelId);
  }, [form.hostelId, rooms]);

  const saveBed = async () => {
    if (!form.bedNo || !form.roomId || !form.hostelId) return alert('Fill all fields');
    try {
      if (editingBed) {
        await api.put(`/beds/${editingBed.id}`, form, { headers });
      } else {
        await api.post('/beds', form, { headers });
      }
      setModalOpen(false);
      fetchData();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Error saving bed');
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
    setForm({ bedNo: bed.bedNo, status: bed.status, roomId: bed.roomId, hostelId: bed.hostelId });
    setModalOpen(true);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-4 md:p-10">
      <div className="max-w-6xl mx-auto">
        
        {/* TOP NAVIGATION */}
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-black text-[10px] uppercase tracking-widest transition-colors">
            <FaArrowLeft /> Back
          </button>
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12}/>
            <input 
              className="pl-9 pr-4 py-2 bg-white rounded-xl text-xs font-bold border-none shadow-sm focus:ring-2 focus:ring-indigo-600 outline-none w-48 md:w-64"
              placeholder="Search Bed Number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-4 tracking-tighter">
              <span className="bg-indigo-600 text-white p-4 rounded-[1.5rem] shadow-lg">
                <FaBed size={22} />
              </span>
              {filterRoomId ? `ROOM ${rooms.find(r => r.id === filterRoomId)?.roomNo} BEDS` : 'BED INVENTORY'}
            </h1>
          </div>
          <button onClick={openAdd} className="bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl flex items-center gap-2 transition-transform active:scale-95">
            <FaPlus /> Add New Bed
          </button>
        </div>

        {/* BED GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBeds.map((b) => (
            <div key={b.id} className="bg-white rounded-[2.5rem] p-7 border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${b.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    <FaHashtag size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Asset ID</p>
                    <p className="text-xl font-black text-slate-900">Bed {b.bedNo}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(b)} className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"><FaEdit /></button>
                  <button onClick={async () => { if(confirm('Delete?')) { await api.delete(`/beds/${b.id}`, {headers}); fetchData(); }}} className="p-2 text-slate-300 hover:text-rose-600 transition-colors"><FaTrash /></button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl">
                   <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                      <FaBuilding className="text-indigo-300" /> {b.room?.roomNo} ({b.hostel?.name})
                   </div>
                   <div className={`text-[10px] font-black px-2 py-1 rounded-md ${b.status === 'AVAILABLE' ? 'text-emerald-600 bg-emerald-100/50' : 'text-rose-600 bg-rose-100/50'}`}>
                     {b.status}
                   </div>
                </div>

                {b.resident ? (
                  <div className="p-4 border-2 border-indigo-50 rounded-2xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                      {b.resident.fullName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-indigo-600 uppercase">Occupant</p>
                      <p className="text-sm font-bold text-slate-800">{b.resident.fullName}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border-2 border-dashed border-slate-100 rounded-2xl text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No Resident Assigned</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
 {/* IMPROVED FORM MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20">
            
            {/* Modal Header: High Contrast Slate */}
            <div className="bg-slate-900 px-10 py-8 text-white flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-1">Asset Management</p>
                <h2 className="text-2xl font-black tracking-tight uppercase italic">
                  {editingBed ? 'Update Bed Detail' : 'Register New Bed'}
                </h2>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all">
                <FaTimes size={18}/>
              </button>
            </div>

            {/* Modal Body: Clear Fields with Floating Labels */}
            <div className="p-10 space-y-7">
              
              {/* Field: Bed Number */}
              <div className="relative group">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest absolute -top-2 left-4 bg-white px-2 z-10 transition-colors group-focus-within:text-indigo-600">
                  Bed Number / Label
                </label>
                <div className="flex items-center bg-slate-50 border-2 border-slate-100 rounded-2xl focus-within:border-indigo-600 focus-within:bg-white transition-all overflow-hidden">
                  <div className="pl-5 text-slate-300"><FaHashtag /></div>
                  <input 
                    value={form.bedNo} 
                    onChange={(e) => setForm({ ...form, bedNo: e.target.value })} 
                    className="w-full bg-transparent border-none px-4 py-5 font-black text-slate-800 outline-none placeholder:text-slate-200 placeholder:font-normal" 
                    placeholder="e.g. B-101 or North-01" 
                  />
                </div>
              </div>

              {/* Row: Hostel & Room Selection */}
              <div className="grid grid-cols-2 gap-6">
                <div className="relative group">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest absolute -top-2 left-4 bg-white px-2 z-10 transition-colors group-focus-within:text-indigo-600">
                    Hostel Location
                  </label>
                  <select 
                    disabled={!!filterHostelId} 
                    value={form.hostelId} 
                    onChange={(e) => setForm({ ...form, hostelId: e.target.value, roomId: '' })} 
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-5 font-black text-slate-800 outline-none appearance-none disabled:opacity-50 focus:border-indigo-600 focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="">Select Hostel</option>
                    {hostels.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </select>
                </div>

                <div className="relative group">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest absolute -top-2 left-4 bg-white px-2 z-10 transition-colors group-focus-within:text-indigo-600">
                    Room Number
                  </label>
                  <select 
                    disabled={!!filterRoomId} 
                    value={form.roomId} 
                    onChange={(e) => setForm({ ...form, roomId: e.target.value })} 
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-5 font-black text-slate-800 outline-none appearance-none disabled:opacity-50 focus:border-indigo-600 focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="">Select Room</option>
                    {modalFilteredRooms.map((r) => <option key={r.id} value={r.id}>{r.roomNo}</option>)}
                  </select>
                </div>
              </div>

              {/* Field: Visual Status Selection (Segmented Control) */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                  Availability Status
                </label>
                <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-[1.5rem] border border-slate-200">
                  {['AVAILABLE', 'OCCUPIED', 'MAINTENANCE'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setForm({...form, status})}
                      className={`py-3 rounded-xl text-[9px] font-black transition-all duration-200 ${
                        form.status === status 
                          ? 'bg-white shadow-md text-indigo-600 scale-[1.02] ring-1 ring-slate-200/50' 
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button 
                  onClick={() => setModalOpen(false)} 
                  className="flex-1 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button 
                  onClick={saveBed} 
                  className="flex-1 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest bg-indigo-600 text-white shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
                >
                  {editingBed ? 'Update Asset' : 'Register Bed'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}