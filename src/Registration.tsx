import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, Lock, ArrowRight, CheckCircle, 
  ShieldCheck, Smartphone, Search, Loader2, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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
      // Persist normalized values so final registration never sends formatted/short values.
      setFormData(prev => ({ ...prev, phoneNumber: valid.phoneDigits, faydaId: valid.faydaDigits }));

      await api.post('/otp/send', { phoneNumber: valid.phoneDigits });
      setStep(otpBypassEnabled ? 3 : 2);
      setResendTimer(30);
    } catch (err) {
      setError('Identity verification failed to initialize');
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

  const handleCustomAttrChange = (name: string, value: any) => {
    setCustomAttributes(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4 font-sans text-stone-900">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-2xl max-w-2xl w-full border border-stone-200"
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
                <div className="w-20 h-20 bg-stone-900 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-stone-200">
                  <ShieldCheck className="text-emerald-400 w-12 h-12" />
                </div>
                <h2 className="text-4xl font-black uppercase tracking-tighter">Select Organization</h2>
                <p className="text-stone-400 text-sm font-bold uppercase tracking-widest">Connect with your community to continue</p>
              </div>

              <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {organizations.map(org => (
                  <button 
                    key={org.id} 
                    onClick={() => {
                      setFormData(prev => ({ ...prev, orgId: org.id }));
                      setConfig(org);
                      setStep(1);
                    }}
                    className="flex items-center justify-between p-8 bg-stone-50 border border-stone-100 rounded-[3rem] hover:bg-stone-900 hover:text-white transition-all group text-left"
                  >
                    <div>
                      <div className="font-black uppercase tracking-tight text-xl">{org.name}</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest opacity-60 mt-1">{org.slug}.memberflow.pro</div>
                    </div>
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                      <ArrowRight className="w-6 h-6 group-hover:text-white transition-colors" />
                    </div>
                  </button>
                ))}
              </div>

              <div className="text-center pt-6">
                <Link to="/login" className="text-xs font-black text-stone-400 hover:text-stone-900 transition-colors uppercase tracking-[0.3em]">Already have an account? Sign In</Link>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-black uppercase tracking-tighter">Identity Check</h2>
                <p className="text-stone-400 text-sm font-bold uppercase tracking-widest">Registering for {config?.name}</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase text-stone-400 tracking-widest pl-2">Phone Number</label>
                  <div className="relative">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 w-5 h-5" />
                    <input name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className="w-full pl-12 pr-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold" placeholder="0911223344" required />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase text-stone-400 tracking-widest pl-2">Fayda ID Number</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 w-5 h-5" />
                    <input name="faydaId" value={formData.faydaId} onChange={handleInputChange} className="w-full pl-12 pr-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold" placeholder="ID-123-456-789" required />
                  </div>
                </div>
                {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold">{error}</div>}
                
                <div className="flex gap-4 pt-4">
                  {!orgSlug && <button onClick={() => setStep(0)} className="p-4 bg-stone-100 text-stone-400 rounded-2xl hover:bg-stone-200 transition-all"><ArrowRight className="w-6 h-6 rotate-180" /></button>}
                  <button onClick={handleRequestOtp} disabled={loading} className="flex-1 bg-stone-900 text-white font-black py-4 rounded-2xl hover:bg-stone-800 transition-all shadow-xl shadow-stone-200 uppercase tracking-widest flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Verify & Continue"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-black uppercase tracking-tighter">Verify OTP</h2>
                <p className="text-stone-400 text-sm font-bold uppercase tracking-widest">Enter the code sent to your device</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-1 text-center">
                  <label className="block text-[10px] font-black uppercase text-stone-400 tracking-widest mb-4">6-Digit Code</label>
                  <input name="otp" value={formData.otp} onChange={handleInputChange} className="w-full text-center text-4xl font-black tracking-[0.5em] py-6 bg-stone-50 border border-stone-100 rounded-[2.5rem] focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all" placeholder="000000" maxLength={6} required />
                </div>
                {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold text-center">{error}</div>}
                <div className="text-center">
                  <button onClick={handleRequestOtp} disabled={resendTimer > 0} className="text-xs font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-widest disabled:text-stone-300">
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Security Code"}
                  </button>
                </div>
                {otpBypassEnabled && (
                  <div className="text-center text-[10px] font-black uppercase tracking-widest text-stone-400">
                    Dev bypass enabled: enter <span className="text-stone-900">000000</span> or{' '}
                    <button type="button" onClick={() => setStep(3)} className="text-emerald-600 hover:text-emerald-700 underline">
                      skip OTP
                    </button>
                  </div>
                )}
                <button onClick={handleVerifyOtp} disabled={loading} className="w-full bg-stone-900 text-white font-black py-5 rounded-2xl hover:bg-stone-800 transition-all shadow-xl shadow-stone-200 uppercase tracking-widest flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="animate-spin w-6 h-6" /> : "Confirm Security Check"}
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.form 
              key="step3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onSubmit={handleFinalRegister} 
              className="space-y-6"
            >
              <div className="text-center space-y-2 mb-8">
                <h2 className="text-3xl font-black uppercase tracking-tighter">Final Details</h2>
                <p className="text-stone-400 text-sm font-bold uppercase tracking-widest">Complete your professional profile</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase text-stone-400 tracking-widest pl-2">Full Legal Name</label>
                  <input name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold" placeholder="Abebe Bikila" required />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase text-stone-400 tracking-widest pl-2">Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold" placeholder="abebe@example.com" required />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-stone-400 tracking-widest pl-2">Secure Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold" placeholder="••••••••" required />
              </div>

              {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold">{error}</div>}

              <div className="flex justify-between items-center">
                <button type="button" onClick={() => setStep(1)} className="text-xs font-black uppercase tracking-widest text-stone-400 hover:text-stone-900">
                  Edit phone / Fayda ID
                </button>
                <div className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                  Phone: {normalizeDigits(formData.phoneNumber)} · Fayda: {normalizeDigits(formData.faydaId)}
                </div>
              </div>

              {config?.customAttributeDefinitions?.length > 0 && (
                <div className="space-y-4 pt-6 border-t border-stone-50">
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] pl-1">Organizational Requirements</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {config.customAttributeDefinitions.map((attr: any) => (
                      <div key={attr.name} className="space-y-1">
                        <label className="block text-[10px] font-black uppercase text-stone-400 tracking-widest pl-2">{attr.label}</label>
                        {attr.type === 'select' ? (
                          <select value={customAttributes[attr.name] || ''} onChange={(e) => handleCustomAttrChange(attr.name, e.target.value)} className="w-full px-4 py-2 bg-stone-50 border border-stone-100 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all" required>
                            <option value="">Select...</option>
                            {attr.options?.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        ) : (
                          <input type={attr.type} value={customAttributes[attr.name] || ''} onChange={(e) => handleCustomAttrChange(attr.name, e.target.value)} className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder={attr.label} required />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button type="submit" disabled={loading} className="w-full bg-stone-900 text-white font-black py-5 rounded-2xl hover:bg-stone-800 transition-all shadow-2xl shadow-stone-200 uppercase tracking-widest flex items-center justify-center gap-3">
                {loading ? <Loader2 className="animate-spin w-6 h-6" /> : "Complete Professional Onboarding"}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Registration;
