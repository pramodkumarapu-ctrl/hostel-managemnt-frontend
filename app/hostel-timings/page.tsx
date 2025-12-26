'use client';

import { useEffect, useState } from 'react';
import { Clock, Plus, Trash2, Edit } from 'lucide-react';

const HOSTEL_TIMINGS_API = 'http://localhost:3001/hostel-timings';
const HOSTELS_API = 'http://localhost:3001/hostels';

const days = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'];

export default function HostelTimingsPage() {
  const [timings, setTimings] = useState<any[]>([]);
  const [hostels, setHostels] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    hostelId: '',
    dayType: 'MONDAY',
    inTime: '',
    outTime: '',
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    const [t, h] = await Promise.all([
      fetch(HOSTEL_TIMINGS_API).then(res => res.json()),
      fetch(HOSTELS_API).then(res => res.json()),
    ]);
    setTimings(t);
    setHostels(h);
  };

  const submit = async () => {
    if (!form.hostelId || !form.dayType || !form.inTime || !form.outTime) return;

    await fetch(editingId ? `${HOSTEL_TIMINGS_API}/${editingId}` : HOSTEL_TIMINGS_API, {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    setForm({ hostelId: '', dayType: 'MONDAY', inTime: '', outTime: '' });
    setEditingId(null);
    fetchAll();
  };

  const edit = (t: any) => {
    setEditingId(t.id);
    setForm({
      hostelId: t.hostelId,
      dayType: t.dayType,
      inTime: t.inTime,
      outTime: t.outTime,
    });
  };

  const remove = async (id: string) => {
    await fetch(`${HOSTEL_TIMINGS_API}/${id}`, { method: 'DELETE' });
    fetchAll();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">

      <h1 className="text-3xl font-bold mb-6">⏰ Hostel Timings</h1>

      {/* Form */}
      <div className="bg-white rounded-2xl shadow p-5 mb-8 grid grid-cols-1 md:grid-cols-5 gap-4">

        <select className="input"
          value={form.hostelId}
          onChange={e => setForm({ ...form, hostelId: e.target.value })}>
          <option value="">Select Hostel</option>
          {hostels.map(h => (
            <option key={h.id} value={h.id}>{h.name}</option>
          ))}
        </select>

        <select className="input"
          value={form.dayType}
          onChange={e => setForm({ ...form, dayType: e.target.value })}>
          {days.map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        <input type="time" className="input"
          value={form.inTime}
          onChange={e => setForm({ ...form, inTime: e.target.value })} />

        <input type="time" className="input"
          value={form.outTime}
          onChange={e => setForm({ ...form, outTime: e.target.value })} />

        <button onClick={submit}
          className="bg-indigo-600 text-white rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700">
          <Plus size={18} /> {editingId ? 'Update' : 'Add'}
        </button>
      </div>

      {/* Timings List */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {timings.map(t => (
          <div key={t.id} className="bg-white rounded-2xl shadow p-5">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="text-indigo-600" />
              <h2 className="text-lg font-semibold">{t.hostel?.name}</h2>
            </div>

            <p className="text-sm text-gray-600 mb-1">Day: {t.dayType}</p>
            <p className="text-sm">In: {t.inTime}</p>
            <p className="text-sm">Out: {t.outTime}</p>

            <div className="flex justify-between mt-4">
              <button onClick={() => edit(t)} className="flex items-center gap-1 text-indigo-600">
                <Edit size={16} /> Edit
              </button>
              <button onClick={() => remove(t.id)} className="flex items-center gap-1 text-red-500">
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
