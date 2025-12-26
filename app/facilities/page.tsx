'use client';

import { useEffect, useState, useMemo } from 'react';
import { 
  Plus, Trash2, Edit, CheckCircle, XCircle, 
  Clock, LayoutGrid, Search, Building2, Zap
} from 'lucide-react';
import api from '../lib/api'; 

// 1. FIXED TYPES TO PREVENT RED ERRORS
interface Hostel {
  id: string;
  name: string;
}

interface Facility {
  id: string;
  hostelId: string;
  name: string;
  description?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  isActive: boolean;
  hostel?: Hostel; // The relation object
}

const INBUILT_FACILITIES = [
  "High-Speed WiFi", "24/7 Power Backup", "Gym", 
  "Laundry", "CCTV Security", "Hot Water", "Housekeeping"
];

export default function FacilitiesPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [form, setForm] = useState({
    hostelId: '',
    name: '',
    description: '',
    startTime: '',
    endTime: '',
    isActive: true,
  });

  const getHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const config = getHeaders();
      const [fRes, hRes] = await Promise.all([
        api.get('/facilities', config),
        api.get('/hostels', config),
      ]);
      setFacilities(fRes.data || []);
      setHostels(hRes.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  // Filter facilities based on search
  const filteredFacilities = useMemo(() => {
    return facilities.filter(f => 
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.hostel?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, facilities]);

  const submit = async () => {
    if (!form.hostelId || !form.name) {
      alert("Please select a Hostel and enter a Name.");
      return;
    }

    setLoading(true);
    try {
      const config = getHeaders();
      if (editingId) {
        await api.put(`/facilities/${editingId}`, form, config);
      } else {
        await api.post('/facilities', form, config);
      }
      setForm({ hostelId: '', name: '', description: '', startTime: '', endTime: '', isActive: true });
      setEditingId(null);
      fetchAll();
    } catch (err: any) {
      alert(err.response?.data?.message || "Operation failed.");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this facility permanently?")) return;
    try {
      await api.delete(`/facilities/${id}`, getHeaders());
      fetchAll();
    } catch (err) {
      alert("Delete failed.");
    }
  };

  const startEdit = (f: Facility) => {
    setEditingId(f.id);
    setForm({
      hostelId: f.hostelId,
      name: f.name,
      description: f.description || '',
      startTime: f.startTime || '',
      endTime: f.endTime || '',
      isActive: f.isActive,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-12 text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-none">
              FACILITIES<span className="text-indigo-600">.</span>
            </h1>
            <p className="text-slate-400 font-bold text-[10px] tracking-[0.4em] mt-4 uppercase">Infrastructure & Services Control</p>
          </div>
          
          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" 
              placeholder="Filter services..." 
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border-none shadow-sm font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        {/* REGISTRATION FORM (NEUBRUTALIST) */}
        <div className="bg-white border-[4px] border-slate-900 rounded-[2.5rem] p-6 md:p-10 mb-16 shadow-[15px_15px_0px_0px_rgba(79,70,229,0.1)]">
          <div className="flex items-center gap-3 mb-8">
            <Zap className="text-indigo-600" fill="currentColor" />
            <h2 className="text-2xl font-black uppercase italic tracking-tight">
              {editingId ? 'Edit Configuration' : 'Register New Utility'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Assign Hostel</label>
              <select className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold text-sm outline-none focus:border-indigo-600 appearance-none"
                value={form.hostelId} onChange={e => setForm({...form, hostelId: e.target.value})}>
                <option value="">Select Building</option>
                {hostels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>

            <div className="space-y-2 lg:col-span-2">
              <label className="text-[9px] font-black uppercase text-indigo-600 tracking-widest ml-1">Service Name (Typed / Inbuilt)</label>
              <div className="relative">
                <input list="inbuilt" className="w-full bg-indigo-50/30 border-2 border-indigo-100 p-4 rounded-2xl font-bold text-sm outline-none focus:border-indigo-600"
                  placeholder="Type anything (e.g. WiFi)" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                <datalist id="inbuilt">{INBUILT_FACILITIES.map(f => <option key={f} value={f} />)}</datalist>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Active Hours</label>
              <div className="flex gap-2">
                <input type="time" className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold text-xs" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} />
                <input type="time" className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold text-xs" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} />
              </div>
            </div>

            <button onClick={submit} disabled={loading} className="w-full bg-slate-900 text-white p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-600 transition-all active:scale-95 shadow-lg">
              {loading ? 'SYNCING...' : (editingId ? 'SAVE CHANGES' : 'DEPLOY SERVICE')}
            </button>
          </div>
        </div>

        {/* UNIFORM CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredFacilities.map(f => (
            <div key={f.id} className="h-[300px] bg-white rounded-[2.5rem] border-2 border-slate-100 p-8 flex flex-col justify-between hover:border-slate-900 hover:shadow-2xl transition-all duration-300 group relative">
              
              <div className="flex justify-between items-start">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                  <LayoutGrid size={24} />
                </div>
                <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${f.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  {f.isActive ? <CheckCircle size={12}/> : <XCircle size={12}/>}
                  {f.isActive ? 'Online' : 'Disabled'}
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2 truncate">{f.name}</h3>
                <div className="flex items-center gap-2 text-slate-400 mb-4 font-bold text-[10px] uppercase tracking-widest">
                  <Building2 size={12} className="text-slate-300" />
                  <span>{f.hostel?.name || 'Standard Unit'}</span>
                </div>
                <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 w-fit px-4 py-2 rounded-xl border border-indigo-100">
                  <Clock size={14} />
                  <span className="text-[10px] font-black">{f.startTime || '00:00'} — {f.endTime || '23:59'}</span>
                </div>
              </div>

              {/* ACTION BUTTONS (INLINE + HOVER) */}
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => startEdit(f)} 
                  className="flex-1 flex items-center justify-center gap-2 py-4 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 hover:bg-slate-900 hover:text-white transition-all"
                >
                  <Edit size={16} /> Edit
                </button>
                <button 
                  onClick={() => remove(f.id)} 
                  className="px-6 rounded-2xl bg-slate-100 text-slate-400 hover:bg-rose-500 hover:text-white transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredFacilities.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[3rem] border-4 border-dashed border-slate-100">
            <p className="text-slate-300 font-black uppercase tracking-widest">No matching facilities found</p>
          </div>
        )}
      </div>
    </div>
  );
}