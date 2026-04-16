import React, { useState } from 'react';
import { UserPlus, Loader2, ArrowLeft, Mail, Lock, User, Building2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import api from './services';

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    orgName: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post('/auth/register', formData);
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden font-sans text-white">
      
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[150px] rounded-full -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 blur-[150px] rounded-full -z-10" />

      {/* Navigation Control */}
      <Link to="/" className="absolute top-8 left-8 p-4 bg-stone-900/50 text-white rounded-2xl border border-white/5 hover:border-emerald-500/40 transition-all backdrop-blur-md group">
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
      </Link>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-stone-900/40 backdrop-blur-2xl p-8 md:p-12 rounded-[3.5rem] shadow-3xl max-w-xl w-full border border-white/5 relative"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-white/10">
            <UserPlus className="text-black w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Create Account</h1>
          <p className="text-stone-500 mt-2 font-bold uppercase tracking-[0.2em] text-[10px]">Join the Network</p>
        </div>

        <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Full Name Field */}
          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase text-stone-500 tracking-[0.2em] pl-2">Full Name</label>
            <div className="relative group">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-600 group-focus-within:text-emerald-400 transition-colors" />
              <input 
                type="text" 
                required
                className="w-full pl-12 pr-4 py-4 bg-stone-950/50 border border-white/5 rounded-2xl focus:border-emerald-500/50 outline-none transition-all font-bold text-sm placeholder:text-stone-800"
                placeholder="Enter full name"
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

          {/* Organization Field */}
          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase text-stone-500 tracking-[0.2em] pl-2">Organization</label>
            <div className="relative group">
              <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-600 group-focus-within:text-emerald-400 transition-colors" />
              <input 
                type="text" 
                className="w-full pl-12 pr-4 py-4 bg-stone-950/50 border border-white/5 rounded-2xl focus:border-emerald-500/50 outline-none transition-all font-bold text-sm placeholder:text-stone-800"
                placeholder="Entity name"
                onChange={(e) => setFormData({...formData, orgName: e.target.value})}
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="md:col-span-2 space-y-2">
            <label className="block text-[10px] font-black uppercase text-stone-500 tracking-[0.2em] pl-2">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-600 group-focus-within:text-emerald-400 transition-colors" />
              <input 
                type="email" 
                required
                className="w-full pl-12 pr-4 py-4 bg-stone-950/50 border border-white/5 rounded-2xl focus:border-emerald-500/50 outline-none transition-all font-bold text-sm placeholder:text-stone-800"
                placeholder="contact@example.com"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="md:col-span-2 space-y-2">
            <label className="block text-[10px] font-black uppercase text-stone-500 tracking-[0.2em] pl-2">Password</label>
            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-600 group-focus-within:text-emerald-400 transition-colors" />
              <input 
                type="password" 
                required
                className="w-full pl-12 pr-4 py-4 bg-stone-950/50 border border-white/5 rounded-2xl focus:border-emerald-500/50 outline-none transition-all font-bold text-sm placeholder:text-stone-800"
                placeholder="••••••••"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          {/* Error Feedback */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="md:col-span-2 p-4 bg-red-500/10 text-red-400 rounded-2xl text-[11px] font-bold border border-red-500/20"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submission */}
          <button 
            type="submit" 
            disabled={loading}
            className="md:col-span-2 w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(16,185,129,0.2)] active:scale-[0.98] disabled:opacity-50 mt-4 group"
          >
            {loading ? <Loader2 className="animate-spin w-6 h-6" /> : (
              <>
                <span className="uppercase tracking-[0.2em] text-sm">Create Account</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-white/5 text-center">
          <p className="text-stone-500 text-xs font-medium">
            Already have an account? <Link to="/login" className="text-white font-bold hover:text-emerald-400 underline underline-offset-4 ml-1 transition-colors">Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}