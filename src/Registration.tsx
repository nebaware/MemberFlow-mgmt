import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { verifyFaydaId, sendOtp, verifyOtp } from './services';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Loader2, CheckCircle, ShieldCheck, Phone, Mail, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const schema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phoneNumber: z.string().min(10, "Valid phone number required"),
  faydaId: z.string().length(10, "Fayda ID must be 10 digits"),
});

type FormData = z.infer<typeof schema>;

export default function Registration() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [formData, setFormData] = useState<FormData | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const onInitialSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Verify Fayda ID
      const faydaRes: any = await verifyFaydaId(data.faydaId);
      if (!faydaRes.success) {
        throw new Error(faydaRes.error);
      }

      // 2. Send OTP
      await sendOtp(data.phoneNumber);
      
      setFormData(data);
      setStep(2);
      setResendTimer(60);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!formData || resendTimer > 0) return;
    setLoading(true);
    try {
      await sendOtp(formData.phoneNumber);
      setResendTimer(60);
      setError(null);
    } catch (err: any) {
      setError("Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const onOtpVerify = async () => {
    if (!formData) return;
    setLoading(true);
    setError(null);
    try {
      const isVerified = await verifyOtp(formData.phoneNumber, otp);
      if (!isVerified) throw new Error("Invalid OTP");

      // 3. Create User
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      await updateProfile(userCredential.user, { displayName: formData.fullName });

      // 4. Create Member Record
      const memberPath = `members/${userCredential.user.uid}`;
      try {
        await setDoc(doc(db, 'members', userCredential.user.uid), {
          uid: userCredential.user.uid,
          fullName: formData.fullName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          faydaId: formData.faydaId,
          faydaVerified: true,
          status: 'pending',
          membershipType: 'Standard',
          otpVerified: true,
          createdAt: new Date().toISOString()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, memberPath);
      }

      setStep(3);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-stone-200"
      >
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Join MemberFlow</h1>
          <p className="text-stone-500 mt-2">Secure registration with Fayda ID</p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.form 
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleSubmit(onInitialSubmit)} 
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
                  <input {...register("fullName")} className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="John Doe" />
                </div>
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
                  <input {...register("email")} className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="john@example.com" />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
                  <input {...register("phoneNumber")} className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="+251..." />
                </div>
                {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Fayda ID (10 Digits)</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
                  <input {...register("faydaId")} className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="1234567890" />
                </div>
                {errors.faydaId && <p className="text-red-500 text-xs mt-1">{errors.faydaId.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Password</label>
                <input type="password" {...register("password")} className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Verify Identity"}
              </button>
            </motion.form>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <p className="text-stone-600">We've sent an OTP to your phone.</p>
                <p className="font-mono text-lg mt-2">{formData?.phoneNumber}</p>
              </div>
              <input 
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full text-center text-3xl tracking-[1em] py-4 bg-stone-50 border-2 border-stone-200 rounded-xl focus:border-emerald-500 outline-none"
                maxLength={6}
                placeholder="000000"
              />
              {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
              <button 
                onClick={onOtpVerify}
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Verify & Register"}
              </button>
              <div className="text-center mt-4">
                <button 
                  onClick={handleResendOtp}
                  disabled={resendTimer > 0 || loading}
                  className={`text-sm font-medium ${resendTimer > 0 ? 'text-stone-400' : 'text-emerald-600 hover:text-emerald-700'}`}
                >
                  {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4"
            >
              <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto" />
              <h2 className="text-2xl font-bold text-stone-900">Registration Complete!</h2>
              <p className="text-stone-600">Your account is pending approval. You can now log in to complete your profile.</p>
              <button 
                onClick={() => window.location.href = '/'}
                className="w-full bg-stone-900 text-white font-semibold py-3 rounded-lg"
              >
                Go to Dashboard
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
