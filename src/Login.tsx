import React, { useState } from 'react';
import { ShieldCheck, LogIn, Loader2, UserPlus, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import api from './services';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      const me = await api.get('/auth/me');
      const role = me.data?.user?.role;
      navigate(role === 'member' ? '/member' : '/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid credentials or connection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4 font-sans text-stone-900">
      <Link to="/" className="absolute top-8 left-8 p-3 bg-white text-stone-900 rounded-full shadow-xl hover:bg-stone-50 transition-all active:scale-95 group">
        <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
      </Link>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl max-w-md w-full border border-stone-200"
      >
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-stone-900 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-stone-200">
            <ShieldCheck className="text-emerald-400 w-12 h-12" />
          </div>
          <h1 className="text-4xl font-black text-stone-900 tracking-tighter uppercase">Welcome</h1>
          <p className="text-stone-400 mt-2 font-bold uppercase tracking-widest text-[10px]">Secure Gateway v2.4</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-1">
            <label className="block text-xs font-black uppercase text-stone-400 tracking-widest pl-2">Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold placeholder:text-stone-300"
              placeholder="admin@memberflow.pro"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-black uppercase text-stone-400 tracking-widest pl-2">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold placeholder:text-stone-300"
              placeholder="••••••••"
              required
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-stone-900 hover:bg-stone-800 text-white font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-2xl shadow-stone-200 active:scale-[0.98]"
          >
            {loading ? <Loader2 className="animate-spin w-6 h-6" /> : <LogIn className="w-6 h-6" />} 
            <span className="uppercase tracking-widest">Sign In</span>
          </button>
        </form>

        <div className="mt-10 pt-10 border-t border-stone-50 text-center space-y-4">
          <p className="text-stone-400 text-sm font-medium">New organization member?</p>
          <Link 
            to="/register"
            className="w-full py-4 border-2 border-stone-100 text-stone-900 font-black rounded-2xl hover:border-stone-900 transition-all flex items-center justify-center gap-2 group shadow-sm active:scale-95"
          >
            <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" /> 
            <span className="uppercase tracking-widest">Create Account</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

