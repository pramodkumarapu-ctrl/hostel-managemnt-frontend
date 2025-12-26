'use client';

import { Suspense, useEffect, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  FaEdit, FaTrash, FaPlus, FaTimes, FaBed,
  FaHashtag, FaBuilding, FaArrowLeft, FaSearch
} from 'react-icons/fa';
import api from '../lib/api';

/* ======================= */
/* SUSPENSE WRAPPER (FIX) */
/* ======================= */
export default function BedsPage() {
  return (
    <Suspense fallback={<BedsLoading />}>
      <BedsPageContent />
    </Suspense>
  );
}

/* ======================= */
/* LOADING FALLBACK */
/* ======================= */
function BedsLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

/* ======================= */
/* MAIN PAGE CONTENT */
/* ======================= */
function BedsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const filterRoomId = searchParams.get('roomId');
  const filterHostelId = searchParams.get('hostelId');

  const [beds, setBeds] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [hostels, setHostels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBed, setEditingBed] = useState<any>(null);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({
    bedNo: '',
    status: 'AVAILABLE',
    roomId: '',
    hostelId: '',
  });

  const token = typeof window !== 'undefined'
    ? localStorage.getItem('token')
    : null;

  const headers = { Authorization: `Bearer ${token}` };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bedsRes, roomsRes, hostelsRes] = await Promise.all([
        api.get('/beds', { headers }),
        api.get('/rooms', { headers }),
        api.get('/hostels', { headers }),
      ]);

      setBeds(bedsRes.data || []);
      setRooms(roomsRes.data || []);
      setHostels(hostelsRes.data || []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredBeds = useMemo(() => {
    return beds.filter((b) => {
      const matchRoom = filterRoomId ? b.roomId === filterRoomId : true;
      const matchHostel = filterHostelId ? b.hostelId === filterHostelId : true;
      const matchSearch = b.bedNo.toLowerCase().includes(search.toLowerCase());
      return matchRoom && matchHostel && matchSearch;
    });
  }, [beds, filterRoomId, filterHostelId, search]);

  const modalRooms = useMemo(() => {
    return rooms.filter((r) => r.hostelId === form.hostelId);
  }, [rooms, form.hostelId]);

  const saveBed = async () => {
    if (!form.bedNo || !form.roomId || !form.hostelId) {
      return alert('Fill all fields');
    }

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
    setEditingBed(null);
    setForm({
      bedNo: '',
      status: 'AVAILABLE',
      hostelId: filterHostelId || hostels[0]?.id || '',
      roomId: filterRoomId || '',
    });
    setModalOpen(true);
  };

  const openEdit = (bed: any) => {
    setEditingBed(bed);
    setForm({
      bedNo: bed.bedNo,
      status: bed.status,
      hostelId: bed.hostelId,
      roomId: bed.roomId,
    });
    setModalOpen(true);
  };

  if (loading) return <BedsLoading />;

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-6xl mx-auto">

        {/* TOP BAR */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-xs font-black uppercase text-slate-500 hover:text-indigo-600"
          >
            <FaArrowLeft /> Back
          </button>

          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Bed..."
              className="pl-9 pr-4 py-2 rounded-xl text-xs font-bold shadow-sm"
            />
          </div>
        </div>

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-black flex items-center gap-3">
            <FaBed /> Bed Inventory
          </h1>
          <button
            onClick={openAdd}
            className="bg-slate-900 text-white px-6 py-3 rounded-xl text-xs font-black uppercase"
          >
            <FaPlus /> Add Bed
          </button>
        </div>

        {/* GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBeds.map((b) => (
            <div key={b.id} className="bg-white p-6 rounded-2xl shadow">
              <div className="flex justify-between mb-4">
                <div>
                  <p className="text-xs text-slate-400 font-bold">Bed No</p>
                  <p className="text-xl font-black">{b.bedNo}</p>
                </div>
                <div className="flex gap-2">
                  <FaEdit onClick={() => openEdit(b)} className="cursor-pointer" />
                  <FaTrash
                    onClick={async () => {
                      if (confirm('Delete bed?')) {
                        await api.delete(`/beds/${b.id}`, { headers });
                        fetchData();
                      }
                    }}
                    className="cursor-pointer text-rose-500"
                  />
                </div>
              </div>

              <div className="text-xs font-bold text-slate-600">
                <FaBuilding /> {b.room?.roomNo} • {b.hostel?.name}
              </div>

              <div className={`mt-3 text-xs font-black ${
                b.status === 'AVAILABLE' ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {b.status}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-white p-8 rounded-2xl w-full max-w-lg">
            <h2 className="text-xl font-black mb-6">
              {editingBed ? 'Edit Bed' : 'Add Bed'}
            </h2>

            <input
              placeholder="Bed No"
              value={form.bedNo}
              onChange={(e) => setForm({ ...form, bedNo: e.target.value })}
              className="w-full mb-4 p-3 rounded-xl bg-slate-100"
            />

            <select
              value={form.hostelId}
              onChange={(e) => setForm({ ...form, hostelId: e.target.value, roomId: '' })}
              className="w-full mb-4 p-3 rounded-xl bg-slate-100"
            >
              <option value="">Select Hostel</option>
              {hostels.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>

            <select
              value={form.roomId}
              onChange={(e) => setForm({ ...form, roomId: e.target.value })}
              className="w-full mb-6 p-3 rounded-xl bg-slate-100"
            >
              <option value="">Select Room</option>
              {modalRooms.map((r) => (
                <option key={r.id} value={r.id}>{r.roomNo}</option>
              ))}
            </select>

            <div className="flex gap-4">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 bg-slate-200 py-3 rounded-xl font-black"
              >
                Cancel
              </button>
              <button
                onClick={saveBed}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-black"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
