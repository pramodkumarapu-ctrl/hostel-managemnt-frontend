'use client';

import { useEffect, useState } from 'react';
import {
  LuMessageSquare,
  LuPlus,
  LuPencil,
  LuTrash2,
  LuX,
  LuCircleCheck,
  LuRefreshCw,
  LuCircleSlash,
  LuCalendar
} from 'react-icons/lu';

import api from '../lib/api';

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [residents, setResidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingComplaint, setEditingComplaint] = useState<any>(null);

  const [form, setForm] = useState({
    residentId: '',
    title: '',
    description: '',
    status: 'PENDING',
  });

  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('token')
      : null;

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  /* ================= FETCH DATA ================= */
  const fetchData = async () => {
    setLoading(true);
    try {
      const [complaintsRes, residentsRes] = await Promise.all([
        api.get('/complaints', { headers }),
        api.get('/residents', { headers }),
      ]);
      setComplaints(complaintsRes.data || []);
      setResidents(residentsRes.data || []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ================= SAVE ================= */
  const saveComplaint = async () => {
    try {
      if (editingComplaint) {
        await api.put(
          `/complaints/${editingComplaint.id}`,
          form,
          { headers }
        );
      } else {
        await api.post('/complaints', form, { headers });
      }
      closeModal();
      fetchData();
    } catch {
      alert('Please fill all fields correctly.');
    }
  };

  /* ================= DELETE ================= */
  const deleteComplaint = async (id: string) => {
    if (!confirm('Delete this complaint permanently?')) return;
    await api.delete(`/complaints/${id}`, { headers });
    fetchData();
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingComplaint(null);
  };

  /* ================= STATUS STYLE ================= */
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return 'bg-green-100 text-green-700';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-rose-100 text-rose-700';
    }
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 text-xs font-bold animate-pulse">
        LOADING COMPLAINTS...
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="p-4 lg:p-8">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <LuMessageSquare className="text-indigo-600" />
            Complaint Desk
          </h2>
          <p className="text-sm text-slate-500">
            Manage resident complaints
          </p>
        </div>

        <button
          onClick={() => {
            setForm({
              residentId: residents[0]?.id || '',
              title: '',
              description: '',
              status: 'PENDING',
            });
            setModalOpen(true);
          }}
          className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2"
        >
          <LuPlus size={16} /> New Complaint
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-4 text-[10px] uppercase text-slate-400">
                Resident
              </th>
              <th className="px-6 py-4 text-[10px] uppercase text-slate-400">
                Title
              </th>
              <th className="px-6 py-4 text-[10px] uppercase text-center text-slate-400">
                Status
              </th>
              <th className="px-6 py-4 text-[10px] uppercase text-right text-slate-400">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {complaints.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="font-semibold">
                    {c.resident?.fullName}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <LuCalendar size={12} />
                    {new Date(c.createdAt).toLocaleDateString()}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="font-medium">{c.title}</div>
                  <div className="text-xs text-slate-400 line-clamp-1">
                    {c.description}
                  </div>
                </td>

                <td className="px-6 py-4 text-center">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black ${getStatusStyle(
                      c.status
                    )}`}
                  >
                    {c.status === 'RESOLVED' ? (
                      <LuCircleCheck size={12} />
                    ) : c.status === 'IN_PROGRESS' ? (
                      <LuRefreshCw
                        size={12}
                        className="animate-spin"
                      />
                    ) : (
                      <LuCircleSlash size={12} />
                    )}
                    {c.status}
                  </span>
                </td>

                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => {
                      setEditingComplaint(c);
                      setForm(c);
                      setModalOpen(true);
                    }}
                    className="p-2 text-slate-400 hover:text-slate-900"
                  >
                    <LuPencil size={16} />
                  </button>

                  <button
                    onClick={() => deleteComplaint(c.id)}
                    className="p-2 text-slate-400 hover:text-red-600"
                  >
                    <LuTrash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between mb-4">
              <h3 className="font-bold">
                {editingComplaint ? 'Update Complaint' : 'New Complaint'}
              </h3>
              <button onClick={closeModal}>
                <LuX />
              </button>
            </div>

            <div className="space-y-3">
              <select
                className="w-full border px-3 py-2 rounded"
                value={form.residentId}
                disabled={!!editingComplaint}
                onChange={(e) =>
                  setForm({ ...form, residentId: e.target.value })
                }
              >
                <option value="">Select Resident</option>
                {residents.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.fullName}
                  </option>
                ))}
              </select>

              <input
                className="w-full border px-3 py-2 rounded"
                placeholder="Title"
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
              />

              <textarea
                className="w-full border px-3 py-2 rounded"
                placeholder="Description"
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />

              <select
                className="w-full border px-3 py-2 rounded"
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value })
                }
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={closeModal}
                className="flex-1 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={saveComplaint}
                className="flex-1 bg-slate-900 text-white py-2 rounded text-sm"
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
