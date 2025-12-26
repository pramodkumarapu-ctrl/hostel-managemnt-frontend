'use client';

import { useEffect, useState } from 'react';
import {
  LuUserPlus,
  LuPencil,
  LuTrash2,
  LuX,
  LuShieldCheck,
  LuPhone,
  LuHotel,
  LuMail,
} from 'react-icons/lu';
import api from '../lib/api';

// Matches your Prisma Model + Relations
type Staff = {
  id: string;
  role: string;
  phone: string;
  userId: string;
  hostelId: string;
  user: { id: string; name: string; email: string };
  hostel: { id: string; name: string };
};

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [hostels, setHostels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Staff | null>(null);

  const [form, setForm] = useState({
    userId: '',
    hostelId: '',
    role: '',
    phone: '',
  });

  // Function to get the latest headers to prevent 401 errors
  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return { Authorization: `Bearer ${token}` };
  };

  /* ================= FETCH DATA ================= */

  const loadAll = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      
      // Parallel fetch for efficiency
      const [s, u, h] = await Promise.all([
        api.get('/staff', { headers }),
        api.get('/users', { headers }),
        api.get('/hostels', { headers }),
      ]);

      setStaff(s.data || []);
      setUsers(u.data || []);
      setHostels(h.data || []);
    } catch (err: any) {
      console.error("Fetch Error:", err);
      if (err.response?.status === 401) {
        alert('Session expired. Please log in again.');
      } else {
        alert('Failed to load staff data');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  /* ================= SAVE / UPDATE ================= */

  const saveStaff = async () => {
    if (!form.userId || !form.hostelId || !form.role) {
      return alert('Please fill all required fields');
    }

    try {
      const headers = getAuthHeaders();
      
      if (editing) {
        // PUT /api/staff/:id
        await api.put(`/staff/${editing.id}`, form, { headers });
      } else {
        // POST /api/staff
        await api.post('/staff', form, { headers });
      }

      closeModal();
      loadAll();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Operation failed');
    }
  };

  /* ================= DELETE ================= */

  const removeStaff = async (id: string) => {
    if (!confirm('Remove this staff assignment?')) return;

    try {
      const headers = getAuthHeaders();
      await api.delete(`/staff/${id}`, { headers });
      loadAll();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  /* ================= MODAL LOGIC ================= */

  const openCreate = () => {
    setEditing(null);
    setForm({
      userId: '',
      hostelId: hostels[0]?.id || '',
      role: 'WARDEN',
      phone: '',
    });
    setModalOpen(true);
  };

  const openEdit = (s: Staff) => {
    setEditing(s);
    setForm({
      userId: s.userId,
      hostelId: s.hostelId,
      role: s.role,
      phone: s.phone,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  /* ================= UI RENDERING ================= */

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-400 font-semibold">
        <div className="animate-pulse">Loading Staff Management...</div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 bg-slate-50 min-h-screen">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <LuShieldCheck className="text-indigo-600" /> Staff Management
          </h1>
          <p className="text-sm text-slate-500">
            Assign users to hostel roles (Current Staff: {staff.length})
          </p>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-lg shadow-indigo-200"
        >
          <LuUserPlus size={18} /> Add Staff
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Employee</th>
              <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Hostel</th>
              <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {staff.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-900">{s.user?.name || 'Unknown'}</div>
                  <div className="inline-block px-2 py-0.5 mt-1 text-[10px] bg-indigo-50 text-indigo-600 font-black rounded uppercase">
                    {s.role}
                  </div>
                </td>

                <td className="px-6 py-4 text-sm text-slate-700">
                  <div className="flex items-center gap-2">
                    <LuHotel className="text-slate-400" />
                    {s.hostel?.name || 'No Hostel Assigned'}
                  </div>
                </td>

                <td className="px-6 py-4 text-sm text-slate-700">
                  <div className="flex items-center gap-2">
                    <LuMail className="text-slate-400" size={14} /> {s.user?.email}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <LuPhone className="text-slate-400" size={14} /> {s.phone || '—'}
                  </div>
                </td>

                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => openEdit(s)}
                      className="p-2 rounded-lg hover:bg-indigo-50 text-indigo-600 transition-colors"
                      title="Edit Staff"
                    >
                      <LuPencil size={18} />
                    </button>
                    <button
                      onClick={() => removeStaff(s.id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                      title="Remove Staff"
                    >
                      <LuTrash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {staff.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-20 text-center text-slate-400">
                  <div className="flex flex-col items-center gap-2">
                    <LuShieldCheck size={40} className="text-slate-200" />
                    <p>No staff assigned yet. Click "Add Staff" to begin.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-lg">
                {editing ? 'Update Staff Member' : 'Assign New Staff'}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <LuX size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-1">Select User</label>
                <select
                  disabled={!!editing}
                  value={form.userId}
                  onChange={(e) => setForm({ ...form, userId: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-50"
                >
                  <option value="">-- Choose User --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-1">Assign to Hostel</label>
                <select
                  value={form.hostelId}
                  onChange={(e) => setForm({ ...form, hostelId: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">-- Choose Hostel --</option>
                  {hostels.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-1">Designated Role</label>
                <input
                  placeholder="e.g. WARDEN, SUPERVISOR, MANAGER"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-1">Phone Number</label>
                <input
                  placeholder="Contact details"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 p-6 bg-slate-50 border-t border-slate-100">
              <button
                onClick={closeModal}
                className="flex-1 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={saveStaff}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-bold text-sm shadow-md transition-all active:scale-95"
              >
                {editing ? 'Update Info' : 'Confirm Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}