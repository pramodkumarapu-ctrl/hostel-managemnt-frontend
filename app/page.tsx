'use client';

import { JSX, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  LuHotel, LuLayers, LuDoorOpen, LuBed,
  LuUsers, LuLogOut, LuMenu, LuX, LuClock, 
  LuClipboardList, LuCoffee, LuReceipt, 
  LuMessageSquare, LuPlane, LuUserPlus, LuShieldAlert,
  LuZap // Added for Facilities
} from 'react-icons/lu';

// Page Component Imports
import HostelsPage from './hostels/page';
import FloorsPage from './floors/page';
import RoomsPage from './rooms/page';
import BedsPage from './beds/page';
import ResidentsPage from './residents/page';
import StaffPage from './staff/page';
import FeesPage from './fees/page';
import PaymentsPage from './payments/page';
import ComplaintsPage from './complaints/page';
import LeavesPage from './leaves/page';
import VisitorsPage from './visitors/page';
import EmergencyPage from './emergency/page';
import HostelTimingsPage from './hostel-timings/page';
import FacilitiesPage from './facilities/page';
import FoodMenusPage from './food-menus/page';

type PageKey =
  | 'hostels' | 'floors' | 'rooms' | 'beds'
  | 'residents' | 'staff' | 'fees' | 'payments'
  | 'complaints' | 'leaves' | 'visitors' | 'emergency'
  | 'hostelTimings' | 'facilities' | 'foodMenus';

export default function HomePage() {
  const [activePage, setActivePage] = useState<PageKey>('hostels');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/login');
  }, [router]);

  const handleLogout = () => {
    if (confirm("Sign out of the admin panel?")) {
      localStorage.removeItem('token');
      router.push('/login');
    }
  };

  const pages: Record<PageKey, JSX.Element> = {
    hostels: <HostelsPage />,
    floors: <FloorsPage />,
    rooms: <RoomsPage />,
    beds: <BedsPage />,
    residents: <ResidentsPage />,
    staff: <StaffPage />,
    fees: <FeesPage />,
    payments: <PaymentsPage />,
    complaints: <ComplaintsPage />,
    leaves: <LeavesPage />,
    visitors: <VisitorsPage />,
    emergency: <EmergencyPage />,
    hostelTimings: <HostelTimingsPage />,
    facilities: <FacilitiesPage />,
    foodMenus: <FoodMenusPage />,
  };

  const formatTitle = (key: string) => key.replace(/([A-Z])/g, ' $1').trim();

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-md" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-72 bg-slate-900 z-50 transform transition-transform duration-300 flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 border-r border-slate-800`}>
        
        <div className="flex justify-between items-center p-8 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <LuHotel size={20} />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white leading-none">HMS</h1>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Dashboard</span>
            </div>
          </div>
          <button className="md:hidden text-slate-500 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <LuX size={24} />
          </button>
        </div>

        {/* Scrollable Nav Area */}
        <nav className="px-4 py-2 flex flex-col gap-1.5 overflow-y-auto flex-1 custom-scrollbar">
          <SectionLabel label="Core Inventory" />
          <SidebarItem label="Hostels" icon={<LuHotel size={18}/>} active={activePage === 'hostels'} onClick={() => setActivePage('hostels')} />
          <SidebarItem label="Floors" icon={<LuLayers size={18}/>} active={activePage === 'floors'} onClick={() => setActivePage('floors')} />
          <SidebarItem label="Rooms" icon={<LuDoorOpen size={18}/>} active={activePage === 'rooms'} onClick={() => setActivePage('rooms')} />
          <SidebarItem label="Beds" icon={<LuBed size={18}/>} active={activePage === 'beds'} onClick={() => setActivePage('beds')} />
          
          <SectionLabel label="Management" className="mt-6" />
          <SidebarItem label="Residents" icon={<LuUsers size={18}/>} active={activePage === 'residents'} onClick={() => setActivePage('residents')} />
          <SidebarItem label="Staff" icon={<LuUserPlus size={18}/>} active={activePage === 'staff'} onClick={() => setActivePage('staff')} />
          <SidebarItem label="Visitors" icon={<LuUsers size={18}/>} active={activePage === 'visitors'} onClick={() => setActivePage('visitors')} />

          <SectionLabel label="Billing & Finance" className="mt-6" />
          <SidebarItem label="Fees" icon={<LuClipboardList size={18}/>} active={activePage === 'fees'} onClick={() => setActivePage('fees')} />
          <SidebarItem label="Payments" icon={<LuReceipt size={18}/>} active={activePage === 'payments'} onClick={() => setActivePage('payments')} />

          <SectionLabel label="Ops & Services" className="mt-6" />
          <SidebarItem label="Facilities" icon={<LuZap size={18}/>} active={activePage === 'facilities'} onClick={() => setActivePage('facilities')} />
          <SidebarItem label="Food Menus" icon={<LuCoffee size={18}/>} active={activePage === 'foodMenus'} onClick={() => setActivePage('foodMenus')} />
          <SidebarItem label="Complaints" icon={<LuMessageSquare size={18}/>} active={activePage === 'complaints'} onClick={() => setActivePage('complaints')} />
          <SidebarItem label="Leaves" icon={<LuPlane size={18}/>} active={activePage === 'leaves'} onClick={() => setActivePage('leaves')} />
          <SidebarItem label="Emergency" icon={<LuShieldAlert size={18}/>} active={activePage === 'emergency'} onClick={() => setActivePage('emergency')} />
        </nav>

        {/* User / Logout Section */}
        <div className="p-4 border-t border-slate-800 shrink-0 bg-slate-950/30">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3.5 rounded-xl w-full text-left text-slate-400 font-bold hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-300 group"
          >
            <LuLogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm">Log Out System</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden ml-0 md:ml-72">
        {/* Mobile Navbar */}
        <div className="flex items-center justify-between p-5 bg-white border-b border-slate-200 md:hidden shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-slate-600 bg-slate-100 rounded-lg">
            <LuMenu size={22} />
          </button>
          <h1 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">
            {formatTitle(activePage)}
          </h1>
          <button onClick={handleLogout} className="text-slate-400 p-2">
            <LuLogOut size={20} />
          </button>
        </div>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-auto bg-[#f8fafc] p-4 md:p-10">
          <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {pages[activePage]}
          </div>
        </main>
      </div>
    </div>
  );
}

// Sub-components remains the same
function SectionLabel({ label, className = "" }: { label: string, className?: string }) {
  return (
    <div className={`text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-4 mb-2 ${className}`}>
      {label}
    </div>
  );
}

interface SidebarItemProps {
  label: string;
  icon: JSX.Element;
  active: boolean;
  onClick: () => void;
}

function SidebarItem({ label, icon, active, onClick }: SidebarItemProps) {
  return (
    <button 
      onClick={onClick} 
      className={`flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left transition-all duration-300 group
        ${active 
          ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 font-bold translate-x-1' 
          : 'hover:bg-slate-800 text-slate-400 font-medium hover:text-slate-100'}`}
    >
      <span className={`${active ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'} transition-colors`}>
        {icon}
      </span>
      <span className="text-[13px]">{label}</span>
    </button>
  );
}