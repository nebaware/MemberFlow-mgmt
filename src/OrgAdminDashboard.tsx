import React, { useState } from 'react';
import { 
  Users, CreditCard, ShieldCheck, 
  BarChart3, Settings, LogOut, 
  LayoutDashboard, Bell, Calendar,
  MessageSquare, UserPlus, ChevronRight
} from 'lucide-react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './AuthContext';
import AdminPanel from './AdminPanel';
import Payments from './Payments';
import Events from './Events';
import Blogs from './Blogs';
import OrgSettings from './OrgSettings';
import OrgAdminOverview from './OrgAdminOverview';

export default function OrgAdminDashboard() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/dashboard' },
    { icon: Users, label: 'Members', path: '/dashboard/members' },
    { icon: CreditCard, label: 'Finance', path: '/dashboard/finance' },
    { icon: Calendar, label: 'Events', path: '/dashboard/events' },
    { icon: MessageSquare, label: 'Announcements', path: '/dashboard/blogs' },
    { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
  ];

  return (
    <div className="min-h-screen bg-stone-50 flex font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-stone-200 flex flex-col sticky top-0 h-screen">
        <div className="p-8 pb-4 flex items-center gap-3 border-b border-stone-100">
          <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center">
            <ShieldCheck className="text-emerald-400 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tighter leading-none">ORG ADMIN</h1>
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mt-1">Management Pro</p>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          {menuItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-4 rounded-2xl transition-all group ${
                location.pathname === item.path 
                  ? 'bg-stone-900 text-white shadow-xl translate-x-1' 
                  : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900 hover:translate-x-1'
              }`}
            >
              <item.icon className={`w-5 h-5 ${location.pathname === item.path ? 'text-emerald-400' : 'text-stone-400 group-hover:text-stone-900'}`} />
              <span className="text-sm font-black tracking-tight uppercase">{item.label}</span>
              {location.pathname === item.path && <div className="ml-auto w-1.5 h-6 bg-emerald-400 rounded-full" />}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-stone-100">
          <div className="p-4 bg-stone-900 rounded-2xl text-white mb-4">
             <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Active Org</div>
             <div className="text-sm font-bold truncate">MemberFlow Main</div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all group"
          >
            <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span className="text-xs font-black uppercase tracking-widest">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen p-10">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-4xl font-black tracking-tighter text-stone-900">
              Welcome back, <span className="text-emerald-500">{user?.fullName?.split(' ')[0]}</span>
            </h2>
            <p className="text-stone-500 font-medium mt-1">Operational state is stable. 4 pending approvals.</p>
          </div>
          <div className="flex gap-4">
            <button className="w-12 h-12 bg-white border border-stone-200 rounded-2xl flex items-center justify-center text-stone-400 hover:text-stone-900 transition-all relative">
              <Bell className="w-5 h-5" />
              <div className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            </button>
            <div className="w-12 h-12 bg-stone-900 rounded-2xl flex items-center justify-center font-black text-white shadow-lg">
              {user?.fullName?.[0]}
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Routes>
              <Route path="/" element={<OrgAdminOverview />} />
              <Route path="/members" element={<AdminPanel />} />
              <Route path="/finance" element={<Payments />} />
              <Route path="/events" element={<Events />} />
              <Route path="/blogs" element={<Blogs />} />
              <Route path="/settings" element={<OrgSettings />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}


