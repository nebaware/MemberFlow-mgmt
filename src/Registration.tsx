import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, Lock, ArrowRight, CheckCircle, 
  ShieldCheck, Smartphone, Search, Loader2, X, Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from './services';

const Registration: React.FC = () => {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const navigate = useNavigate();

  const [step, setStep] = useState(orgSlug ? 1 : 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<any>(null);
  const [organizations, setOrganizations] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    faydaId: '',
    otp: '',
    orgId: ''
  });
  const [customAttributes, setCustomAttributes] = useState<Record<string, any>>({});
  const [resendTimer, setResendTimer] = useState(0);
  const otpBypassEnabled = import.meta.env.DEV || import.meta.env.VITE_OTP_BYPASS === 'true';

  const normalizeDigits = (value: string) => (value || '').replace(/[^\d]/g, '');

  const validateIdentityInputs = () => {
    const phoneDigits = normalizeDigits(formData.phoneNumber);
    const faydaDigits = normalizeDigits(formData.faydaId);
    if (phoneDigits.length < 10) return { ok: false as const, message: 'Phone number must be at least 10 digits' };
    if (faydaDigits.length !== 10) return { ok: false as const, message: 'Fayda ID must be exactly 10 digits' };
    return { ok: true as const, phoneDigits, faydaDigits };
  };

  useEffect(() => {
    const fetchOrgData = async () => {
      if (orgSlug) {
        try {
          const res = await api.get(`/org/${orgSlug}`);
          setConfig(res.data);
          setFormData(prev => ({ ...prev, orgId: res.data.id }));
        } catch (err) {
          setError("Invalid organization link");
        }
      } else {
        try {
          const res = await api.get('/organizations/list');
          setOrganizations(res.data);
        } catch (err) {
          setError("Failed to load organizations");
        }
      }
    };
    fetchOrgData();
  }, [orgSlug]);

  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleRequestOtp = async () => {
    const valid = validateIdentityInputs();
    if (!valid.ok) {
      setError(valid.message);
      return;
    }
    setLoading(true);
    try {
      setFormData(prev => ({ ...prev, phoneNumber: valid.phoneDigits, faydaId: valid.faydaDigits }));
      await api.post('/otp/send', { phoneNumber: valid.phoneDigits });
      setStep(otpBypassEnabled ? 3 : 2);
      setResendTimer(30);
    } catch (err) {
      setError('Identity verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpBypassEnabled && formData.otp === '000000') {
      setStep(3);
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/otp/verify', { 
        phoneNumber: formData.phoneNumber, 
        otp: formData.otp 
      });
      if (res.data.success) setStep(3);
      else setError('Invalid security code');
    } catch (err) {
      setError('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const valid = validateIdentityInputs();
    if (!valid.ok) {
      setError(valid.message);
      setStep(1);
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        ...formData,
        phoneNumber: valid.phoneDigits,
        faydaId: valid.faydaDigits,
        customAttributes
      });
      if (res.data.success) {
        localStorage.setItem('memberflow_token', res.data.token);
        navigate('/member');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden font-sans text-white">
      
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[150px] rounded-full -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 blur-[150px] rounded-full -z-10" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-stone-900/40 backdrop-blur-2xl p-8 md:p-12 rounded-[3.5rem] shadow-3xl max-w-2xl w-full border border-white/5 relative"
      >
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div 
              key="step0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <div className="w-20 h-20 bg-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/20">
                  <Building2 className="text-black w-10 h-10" />
                </div>
                <h2 className="text-4xl font-black uppercase tracking-tighter">Select Entity</h2>
                <p className="text-stone-500 text-[10px] font-bold uppercase tracking-[0.2em]">Choose an organization to continue</p>
              </div>

              <div className="grid grid-cols-1 gap-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {organizations.map(org => (
                  <button 
                    key={org.id} 
                    onClick={() => {
                      setFormData(prev => ({ ...prev, orgId: org.id }));
                      setConfig(org);
                      setStep(1);
                    }}
                    className="flex items-center justify-between p-6 bg-stone-950/50 border border-white/5 rounded-[2rem] hover:border-emerald-500/50 transition-all group text-left"
                  >
                    <div>
                      <div className="font-black uppercase tracking-tight text-lg text-white">{org.name}</div>
                      <div className="text-[9px] font-bold uppercase tracking-widest text-stone-600 mt-1">{org.slug}.system</div>
                    </div>
                    <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                      <ArrowRight className="w-5 h-5 group-hover:text-black transition-colors" />
                    </div>
                  </button>
                ))}
              </div>

              <div className="text-center pt-4 border-t border-white/5">
                <Link to="/login" className="text-[10px] font-black text-stone-500 hover:text-emerald-400 transition-colors uppercase tracking-[0.3em]">Already Registered? Sign In</Link>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-black uppercase tracking-tighter">Security Check</h2>
                <p className="text-stone-500 text-[10px] font-bold uppercase tracking-widest">Verifying Identity for {config?.name}</p>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase text-stone-600 tracking-widest pl-2">Phone Identity</label>
                  <div className="relative group">
                    <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-700 group-focus-within:text-emerald-400 w-5 h-5 transition-colors" />
                    <input name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className="w-full pl-14 pr-6 py-5 bg-stone-950/50 border border-white/5 rounded-2xl focus:border-emerald-500/50 outline-none transition-all font-bold text-sm" placeholder="0911000000" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase text-stone-600 tracking-widest pl-2">National ID (Fayda)</label>
                  <div className="relative group">
                    <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-700 group-focus-within:text-emerald-400 w-5 h-5 transition-colors" />
                    <input name="faydaId" value={formData.faydaId} onChange={handleInputChange} className="w-full pl-14 pr-6 py-5 bg-stone-950/50 border border-white/5 rounded-2xl focus:border-emerald-500/50 outline-none transition-all font-bold text-sm" placeholder="1234567890" required />
                  </div>
                </div>
                {error && <div className="p-4 bg-red-500/10 text-red-400 rounded-2xl text-[11px] font-bold border border-red-500/20">{error}</div>}
                <div className="flex gap-4 pt-4">
                  {!orgSlug && <button onClick={() => setStep(0)} className="p-5 bg-stone-900/50 border border-white/5 text-stone-500 rounded-2xl hover:text-white transition-all"><ArrowRight className="w-5 h-5 rotate-180" /></button>}
                  <button onClick={handleRequestOtp} disabled={loading} className="flex-1 bg-white text-black font-black py-5 rounded-2xl hover:bg-emerald-400 transition-all uppercase tracking-widest flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Request Access"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-black uppercase tracking-tighter">OTP Verification</h2>
                <p className="text-stone-500 text-[10px] font-bold uppercase tracking-widest">6-digit security code</p>
              </div>
              <div className="space-y-6">
                <input name="otp" value={formData.otp} onChange={handleInputChange} className="w-full text-center text-5xl font-black tracking-[0.4em] py-8 bg-stone-950/50 border border-white/5 rounded-[2.5rem] focus:border-emerald-500/50 outline-none transition-all text-emerald-400" placeholder="000000" maxLength={6} required />
                {error && <div className="p-4 bg-red-500/10 text-red-400 rounded-2xl text-xs font-bold text-center">{error}</div>}
                <div className="text-center">
                  <button onClick={handleRequestOtp} disabled={resendTimer > 0} className="text-[10px] font-black text-emerald-500 hover:text-emerald-400 uppercase tracking-widest disabled:text-stone-700">
                    {resendTimer > 0 ? `Retry in ${resendTimer}s` : "Resend Security Code"}
                  </button>
                </div>
                <button onClick={handleVerifyOtp} disabled={loading} className="w-full bg-white text-black font-black py-5 rounded-2xl hover:bg-emerald-400 transition-all uppercase tracking-widest flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="animate-spin w-6 h-6" /> : "Verify Identity"}
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.form key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onSubmit={handleFinalRegister} className="space-y-6">
              <div className="text-center space-y-2 mb-8">
                <h2 className="text-3xl font-black uppercase tracking-tighter">Profile Setup</h2>
                <p className="text-stone-500 text-[10px] font-bold uppercase tracking-widest">Complete registration for {config?.name}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase text-stone-600 tracking-widest pl-2">Full Name</label>
                  <input name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full px-6 py-4 bg-stone-950/50 border border-white/5 rounded-2xl focus:border-emerald-500/50 outline-none transition-all font-bold text-sm" placeholder="Full Legal Name" required />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase text-stone-600 tracking-widest pl-2">Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-6 py-4 bg-stone-950/50 border border-white/5 rounded-2xl focus:border-emerald-500/50 outline-none transition-all font-bold text-sm" placeholder="email@domain.com" required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase text-stone-600 tracking-widest pl-2">Secure Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full px-6 py-4 bg-stone-950/50 border border-white/5 rounded-2xl focus:border-emerald-500/50 outline-none transition-all font-bold text-sm" placeholder="••••••••" required />
              </div>

              {config?.customAttributeDefinitions?.length > 0 && (
                <div className="pt-6 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {config.customAttributeDefinitions.map((attr: any) => (
                    <div key={attr.name} className="space-y-2">
                      <label className="block text-[10px] font-black uppercase text-stone-600 tracking-widest pl-2">{attr.label}</label>
                      <input type={attr.type} className="w-full px-6 py-4 bg-stone-950/50 border border-white/5 rounded-2xl focus:border-emerald-500/50 outline-none transition-all font-bold text-sm" placeholder={attr.label} required onChange={(e) => setCustomAttributes(p => ({...p, [attr.name]: e.target.value}))}/>
                    </div>
                  ))}
                </div>
              )}

              <button type="submit" disabled={loading} className="w-full bg-emerald-500 text-black font-black py-5 rounded-2xl hover:bg-emerald-400 transition-all uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/10">
                {loading ? <Loader2 className="animate-spin w-6 h-6" /> : "Initialize Onboarding"}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Registration;