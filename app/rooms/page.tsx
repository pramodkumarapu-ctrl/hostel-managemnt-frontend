'use client';

import { Suspense, useEffect, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaTimes,
  FaBed,
  FaHashtag,
  FaBuilding,
  FaCheckCircle,
  FaExclamationTriangle,
  FaArrowLeft,
} from 'react-icons/fa';
import api from '../lib/api';

/* ========================= */
/* SUSPENSE WRAPPER (FIX) */
/* ========================= */
export default function BedsPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <BedsPageContent />
    </Suspense>
  );
}

/* ========================= */
/* LOADER */
/* ========================= */
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

/* ========================= */
/* MAIN CONTENT */
/* ========================= */
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

  const [form, setForm] = useState({
    bedNo: '',
    status: 'AVAILABLE',
    roomId: '',
    hostelId: '',
  });

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;

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

      if (filterRoomId) {
        bedData = bedData.filter((b: any) => b.roomId === filterRoomId);
      } else if (filterHostelId) {
        bedData = bedData.filter((b: any) => b.hostelId === filterHostelId);
      }

      setBeds(bedData);
      setRooms(resRooms.data || []);
      setHostels(resHostels.data || []);

      if (filterHostelId || filterRoomId) {
        setForm((prev) => ({
          ...prev,
          hostelId: filterHostelId || '',
          roomId: filterRoomId || '',
        }));
      }
    } catch (e) {
      console.error('Fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterRoomId, filterHostelId]);

  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => r.hostelId === form.hostelId);
  }, [form.hostelId, rooms]);

  const saveBed = async () => {
    if (!form.bedNo || !form.roomId || !form.hostelId)
      return alert('Please fill all fields');

    try {
      if (editingBed) {
        await api.put(`/beds/${editingBed.id}`, form, { headers });
      } else {
        await api.post('/beds', form, { headers });
      }
      closeModal();
      fetchData();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Error saving bed');
    }
  };

  const deleteBed = async (id: string) => {
    if (!confirm('Delete this bed?')) return;
    try {
      await api.delete(`/beds/${id}`, { headers });
      fetchData();
    } catch {
      alert('Cannot delete bed. It may be occupied.');
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

  if (loading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-4 md:p-10">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest mb-6"
        >
          <FaArrowLeft /> Go Back
        </button>

        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-black flex items-center gap-4">
            <span className="bg-indigo-600 text-white p-4 rounded-3xl">
              <FaBed />
            </span>
            BED ASSETS
          </h1>

          <button
            onClick={openAdd}
            className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs"
          >
            <FaPlus /> Add Bed
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {beds.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-3xl p-6 border shadow-sm hover:shadow-xl"
            >
              <div className="flex justify-between mb-6">
                <div className="flex items-center gap-3">
                  <FaHashtag />
                  <span className="text-xl font-black">{b.bedNo}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(b)}>
                    <FaEdit />
                  </button>
                  <button onClick={() => deleteBed(b.id)}>
                    <FaTrash className="text-red-500" />
                  </button>
                </div>
              </div>

              <div className="text-xs font-bold text-slate-600">
                <FaBuilding /> {b.hostel?.name} • Room {b.room?.roomNo}
              </div>

              <div className="mt-3 text-[10px] font-black uppercase">
                {b.status === 'AVAILABLE' ? (
                  <span className="text-emerald-600">
                    <FaCheckCircle /> AVAILABLE
                  </span>
                ) : (
                  <span className="text-rose-600">
                    <FaExclamationTriangle /> {b.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md">
            <h2 className="text-xl font-black mb-6">
              {editingBed ? 'Edit Bed' : 'Create Bed'}
            </h2>

            <input
              value={form.bedNo}
              onChange={(e) => setForm({ ...form, bedNo: e.target.value })}
              placeholder="Bed Number"
              className="w-full mb-4 p-3 rounded-xl bg-slate-50"
            />

            <select
              value={form.hostelId}
              onChange={(e) =>
                setForm({ ...form, hostelId: e.target.value, roomId: '' })
              }
              className="w-full mb-4 p-3 rounded-xl bg-slate-50"
            >
              <option value="">Select Hostel</option>
              {hostels.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>

            <select
              value={form.roomId}
              onChange={(e) =>
                setForm({ ...form, roomId: e.target.value })
              }
              className="w-full mb-6 p-3 rounded-xl bg-slate-50"
            >
              <option value="">Select Room</option>
              {filteredRooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.roomNo}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-4">
              <button onClick={closeModal} className="py-3 border rounded-xl">
                Cancel
              </button>
              <button
                onClick={saveBed}
                className="py-3 bg-indigo-600 text-white rounded-xl font-bold"
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
