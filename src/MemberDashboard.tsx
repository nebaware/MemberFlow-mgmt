import React, { useState } from 'react';
import { 
  User, CreditCard, ShieldCheck, 
  LayoutDashboard, Bell, Calendar,
  MessageSquare, LogOut, ChevronRight
} from 'lucide-react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './AuthContext';
import Profile from './Profile';
import Payments from './Payments';
import Events from './Events';
import Blogs from './Blogs';

export default function MemberDashboard() {
  const { user, member, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'My Dashboard', path: '/member' },
    { icon: User, label: 'Profile Settings', path: '/member/profile' },
    { icon: CreditCard, label: 'Payment History', path: '/member/payments' },
    { icon: Calendar, label: 'Events & RSVP', path: '/member/events' },
    { icon: MessageSquare, label: 'Announcements', path: '/member/blogs' },
  ];

  const status = member?.status || 'Active';

  return (
    <div className="min-h-screen bg-stone-50 flex font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-stone-200 flex flex-col sticky top-0 h-screen">
        <div className="p-8 pb-4 flex items-center gap-3 border-b border-stone-100">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tighter leading-none">MEMBER</h1>
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mt-1">Personal Portal</p>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2 text-stone-800">
          {menuItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-4 rounded-2xl transition-all group ${
                location.pathname === item.path 
                  ? 'bg-stone-900 text-white shadow-xl' 
                  : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900'
              }`}
            >
              <item.icon className={`w-5 h-5 ${location.pathname === item.path ? 'text-emerald-400' : 'text-stone-400 group-hover:text-stone-900'}`} />
              <span className="text-sm font-black tracking-tight uppercase">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-stone-100">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all group"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-widest">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen p-10">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-4xl font-black tracking-tighter text-stone-900">
              Hello, <span className="text-emerald-500">{member?.fullName?.split(' ')[0]}</span>
            </h2>
            <p className="text-stone-500 font-medium mt-1">Your membership status: <span className="font-bold text-stone-900 uppercase tracking-widest text-xs">{status}</span></p>
          </div>
          <div className="w-12 h-12 bg-stone-900 rounded-2xl flex items-center justify-center font-black text-white shadow-lg">
            {member?.fullName?.[0]}
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Routes>
              <Route path="/" element={
                 <div className="space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-stone-800">
                     <QuickStat label="Fayda Status" value={member?.faydaVerified ? "Verified" : "Pending"} icon={ShieldCheck} success={member?.faydaVerified} />
                     <QuickStat label="Outstanding Dues" value="0.00 ETB" icon={CreditCard} success />
                     <QuickStat label="Next Event" value="Annual Gala" icon={Calendar} />
                   </div>
                   <div className="bg-emerald-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
                      <div className="relative z-10">
                        <h3 className="text-3xl font-black mb-2">Welcome to your Portal</h3>
                        <p className="text-emerald-100/80 max-w-md font-medium">Access your membership benefits, view internal announcements, and register for upcoming organizational events seamlessly.</p>
                      </div>
                      <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-emerald-800 rounded-full opacity-50 blur-3xl" />
                   </div>
                 </div>
              } />
              <Route path="/profile" element={<Profile />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/events" element={<Events />} />
              <Route path="/blogs" element={<Blogs />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function QuickStat({ label, value, icon: Icon, success }: any) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${success ? 'bg-emerald-50 text-emerald-600' : 'bg-stone-50 text-stone-400'}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase text-stone-400 tracking-widest">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}

