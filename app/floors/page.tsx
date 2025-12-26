'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaTimes,
  FaLayerGroup,
  FaHotel,
  FaHashtag,
  FaArrowLeft,
} from 'react-icons/fa';
import api from '../lib/api';

/* ========================= */
/* SUSPENSE WRAPPER (FIX) */
/* ========================= */
export default function FloorsPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <FloorsPageContent />
    </Suspense>
  );
}

/* ========================= */
/* LOADING FALLBACK */
/* ========================= */
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

/* ========================= */
/* MAIN PAGE CONTENT */
/* ========================= */
function FloorsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

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

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers = { Authorization: `Bearer ${token}` };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [floorRes, hostelRes] = await Promise.all([
        api.get('/floors', { headers }),
        api.get('/hostels', { headers }),
      ]);

      let floorData = Array.isArray(floorRes.data) ? floorRes.data : [];

      if (filterHostelId) {
        floorData = floorData.filter(
          (f: any) => f.hostelId === filterHostelId
        );
        setForm((prev) => ({ ...prev, hostelId: filterHostelId }));
      }

      setFloors(floorData);
      setHostels(Array.isArray(hostelRes.data) ? hostelRes.data : []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterHostelId]);

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
    } catch {
      alert(
        'Error saving floor. Floor number may already exist for this hostel.'
      );
    }
  };

  const deleteFloor = async (id: string) => {
    if (!confirm('Delete this floor?')) return;
    await api.delete(`/floors/${id}`, { headers });
    fetchData();
  };

  const openAdd = () => {
    setEditingFloor(null);
    setForm({
      number: '',
      hostelId: filterHostelId || hostels[0]?.id || '',
    });
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

  if (loading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="max-w-6xl mx-auto mb-6">
        <button
          onClick={() => router.push('/hostels')}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-sm mb-4"
        >
          <FaArrowLeft size={12} /> Back to Hostels
        </button>
      </div>

      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-3">
            <span className="bg-indigo-600 text-white p-3 rounded-2xl">
              <FaLayerGroup />
            </span>
            {filterHostelId
              ? `${hostels.find((h) => h.id === filterHostelId)?.name || 'Hostel'} Floors`
              : 'All Floors'}
          </h1>
          <span className="mt-3 inline-block bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-black">
            Count: {floors.length}
          </span>
        </div>

        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold"
        >
          <FaPlus size={12} /> Add Floor
        </button>
      </div>

      {/* FLOOR CARDS */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {floors.map((f) => (
          <div
            key={f.id}
            className="bg-white rounded-3xl p-6 border shadow-sm hover:shadow-xl transition"
          >
            <div className="flex justify-between mb-6">
              <div className="bg-indigo-50 text-indigo-600 p-3 rounded-2xl">
                <FaHashtag />
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(f)}>
                  <FaEdit />
                </button>
                <button onClick={() => deleteFloor(f.id)}>
                  <FaTrash className="text-red-500" />
                </button>
              </div>
            </div>

            <h2 className="text-2xl font-black">Floor {f.number}</h2>
            <div className="flex items-center gap-2 text-slate-500 mt-2">
              <FaHotel className="text-indigo-400" /> {f.hostel?.name}
            </div>

            <button
              onClick={() => router.push(`/rooms?floorId=${f.id}`)}
              className="mt-6 w-full py-2 bg-slate-50 rounded-xl text-xs font-bold hover:bg-indigo-600 hover:text-white"
            >
              View Rooms ({f.rooms?.length || 0})
            </button>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center px-4 z-50">
          <div className="bg-white w-full max-w-md rounded-3xl p-8">
            <div className="flex justify-between mb-8">
              <h2 className="text-2xl font-extrabold">
                {editingFloor ? 'Edit Floor' : 'Create Floor'}
              </h2>
              <button onClick={closeModal}>
                <FaTimes size={20} />
              </button>
            </div>

            <input
              type="number"
              placeholder="Floor Number"
              value={form.number}
              onChange={(e) =>
                setForm({ ...form, number: e.target.value })
              }
              className="w-full mb-4 p-3 rounded-xl border"
            />

            <select
              value={form.hostelId}
              onChange={(e) =>
                setForm({ ...form, hostelId: e.target.value })
              }
              disabled={!!filterHostelId && !editingFloor}
              className="w-full mb-6 p-3 rounded-xl border"
            >
              <option value="">Select Hostel</option>
              {hostels.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-4">
              <button onClick={closeModal} className="py-3 border rounded-xl">
                Cancel
              </button>
              <button
                onClick={saveFloor}
                className="py-3 bg-indigo-600 text-white rounded-xl font-bold"
              >
                {editingFloor ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
