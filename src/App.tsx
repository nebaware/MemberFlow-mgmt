import React, { useState } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import Registration from './Registration';
import Payments from './Payments';
import AdminPanel from './AdminPanel';
import Profile from './Profile';

import { auth } from './firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { LayoutDashboard, Users, CreditCard, Settings, LogOut, LogIn, UserPlus, ShieldCheck, Menu, X, Loader2, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function Dashboard() {
  const { user, member, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'payments' | 'admin' | 'profile'>('dashboard');

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!user) {
    return <LoginView />;
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin Hub', icon: ShieldCheck }] : []),
  ];


  return (
    <div className="min-h-screen bg-stone-50 flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-stone-900 text-white transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">MemberFlow</span>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id as any); setIsMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === item.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-stone-400 hover:bg-stone-800 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 w-full p-6 border-t border-stone-800">
          <button 
            onClick={() => signOut(auth)}
            className="w-full flex items-center gap-3 px-4 py-3 text-stone-400 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen overflow-y-auto">
        <header className="bg-white border-b border-stone-200 p-4 md:p-6 flex justify-between items-center sticky top-0 z-30">
          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-stone-900">{member?.fullName || user.email}</p>
              <p className="text-xs text-stone-400 capitalize">{member?.status || 'User'}</p>
            </div>
            <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center border border-stone-200">
              <Users className="w-5 h-5 text-stone-400" />
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                    <p className="text-stone-400 text-xs font-bold uppercase tracking-wider mb-2">Member Status</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${member?.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <span className="text-2xl font-bold capitalize">{member?.status || 'Pending'}</span>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                    <p className="text-stone-400 text-xs font-bold uppercase tracking-wider mb-2">Fayda ID</p>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-500" />
                      <span className="text-2xl font-bold">{member?.faydaVerified ? 'Verified' : 'Unverified'}</span>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                    <p className="text-stone-400 text-xs font-bold uppercase tracking-wider mb-2">Membership</p>
                    <span className="text-2xl font-bold">{member?.membershipType || 'Standard'}</span>
                  </div>
                </div>

                <div className="bg-emerald-900 text-white p-8 rounded-3xl relative overflow-hidden shadow-2xl shadow-emerald-900/20">
                  <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-2">Welcome back, {member?.fullName?.split(' ')[0]}!</h2>
                    <p className="text-emerald-100/80 max-w-md">Your membership is currently {member?.status}. Please ensure your annual fees are paid to maintain access.</p>
                    <button 
                      onClick={() => setActiveTab('payments')}
                      className="mt-6 px-6 py-3 bg-white text-emerald-900 rounded-xl font-bold hover:bg-emerald-50 transition-colors"
                    >
                      View Payments
                    </button>
                  </div>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-800 rounded-full -mr-20 -mt-20 opacity-50" />
                </div>
              </motion.div>
            )}

            {activeTab === 'payments' && <Payments />}
            {activeTab === 'admin' && <AdminPanel />}
            {activeTab === 'profile' && <Profile />}

          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function LoginView() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isRegistering) {
    return (
      <div className="relative">
        <Registration />
        <button 
          onClick={() => setIsRegistering(false)}
          className="absolute top-4 right-4 text-stone-500 hover:text-stone-900 font-medium"
        >
          Already have an account? Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full border border-stone-200"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
            <ShieldCheck className="text-white w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Welcome Back</h1>
          <p className="text-stone-400 mt-2">Sign in to manage your membership</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              placeholder="name@company.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <LogIn className="w-5 h-5" />} Sign In
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-stone-100 text-center">
          <p className="text-stone-400">Don't have an account yet?</p>
          <button 
            onClick={() => setIsRegistering(true)}
            className="mt-2 text-emerald-600 font-bold hover:text-emerald-700 flex items-center justify-center gap-2 mx-auto"
          >
            <UserPlus className="w-5 h-5" /> Create Account
          </button>
        </div>
      </motion.div>
    </div>
  );
}

import { ErrorBoundary } from './ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Dashboard />
      </AuthProvider>
    </ErrorBoundary>
  );
}
