import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { collection, addDoc, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { initiateTelebirrPayment, verifyPaymentScreenshot, downloadInvoice } from './services';
import { Payment } from './types';
import { QRCodeSVG } from 'qrcode.react';
import { CreditCard, Smartphone, Receipt, CheckCircle, Clock, AlertCircle, Loader2, Upload, FileText, X as CloseIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Payments() {
  const { member, isAdmin } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [telebirrData, setTelebirrData] = useState<any>(null);
  const [showManual, setShowManual] = useState(false);
  const [showOcr, setShowOcr] = useState(false);
  const [manualAmount, setManualAmount] = useState(500);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  
  // OCR State
  const [ocrFile, setOcrFile] = useState<File | null>(null);
  const [ocrPreview, setOcrPreview] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!member) return;
    const q = isAdmin 
      ? collection(db, 'payments') 
      : query(collection(db, 'payments'), where('memberId', '==', member.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const p = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Payment));
      setPayments(p.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'payments');
    });

    return unsubscribe;
  }, [member, isAdmin]);

  const handleTelebirr = async () => {
    if (!member) return;
    setLoading(true);
    try {
      const res = await initiateTelebirrPayment(500, member.uid);
      setTelebirrData(res);
      
      await addDoc(collection(db, 'payments'), {
        memberId: member.uid,
        amount: 500,
        currency: 'ETB',
        method: 'telebirr',
        status: 'pending',
        transactionId: res.transactionId,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async () => {
    if (!member) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'payments'), {
        memberId: member.uid,
        amount: manualAmount,
        currency: 'ETB',
        method: 'manual',
        status: 'pending',
        createdAt: new Date().toISOString(),
        ...(ocrResult?.parsed?.transactionId ? { transactionId: ocrResult.parsed.transactionId } : {})
      });
      setShowManual(false);
      setShowOcr(false);
      setOcrResult(null);
      setOcrFile(null);
      setOcrPreview(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'payments');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOcrFile(file);
      setOcrPreview(URL.createObjectURL(file));
      setOcrResult(null);
    }
  };

  const handleOcrVerify = async () => {
    if (!ocrFile) return;
    setLoading(true);
    try {
      const res = await verifyPaymentScreenshot(ocrFile);
      setOcrResult(res);
      if (res.success && res.parsed?.amount) {
        setManualAmount(Number(res.parsed.amount));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const confirmPayment = async (id: string) => {
    if (!isAdmin) return;
    setConfirmingId(id);
    try {
      await updateDoc(doc(db, 'payments', id), {
        status: 'completed',
        confirmedBy: auth.currentUser?.uid
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `payments/${id}`);
    } finally {
      setConfirmingId(null);
    }
  };

  const handleDownloadInvoice = (p: Payment) => {
    const memberName = member?.fullName || 'Member';
    downloadInvoice(p.id!, {
      memberName,
      amount: p.amount,
      date: new Date(p.createdAt).toLocaleDateString(),
      method: p.method,
      status: p.status,
      orgName: "MemberFlow Organization"
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Payments & Invoices</h1>
          <p className="text-stone-500 text-sm mt-1">Manage your subscriptions and view payment history</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setShowOcr(true)}
            className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-all font-medium"
          >
            <Upload className="w-4 h-4" /> OCR Verification
          </button>
          <button 
            onClick={() => setShowManual(true)}
            className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-all font-medium"
          >
            <Receipt className="w-4 h-4" /> Manual Entry
          </button>
          <button 
            onClick={handleTelebirr}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all shadow-lg shadow-emerald-200 font-bold"
          >
            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Smartphone className="w-4 h-4" />} Pay with Telebirr
          </button>
        </div>
      </div>

      <AnimatePresence>
        {telebirrData && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white p-8 rounded-3xl border-2 border-emerald-100 mb-8 text-center shadow-xl shadow-emerald-50">
              <h2 className="text-xl font-bold mb-4 text-emerald-900">Complete Telebirr Payment</h2>
              <div className="flex justify-center mb-6 bg-white p-6 rounded-2xl shadow-inner border border-stone-50 inline-block">
                <QRCodeSVG value={telebirrData.qrCode} size={220} />
              </div>
              <p className="text-stone-500 mb-4 max-w-xs mx-auto">Scan this QR code in your Telebirr app or click the link below to pay.</p>
              <div className="flex flex-col gap-3 max-w-xs mx-auto">
                <a href={telebirrData.paymentUrl} target="_blank" rel="noreferrer" className="block w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors">
                  Open Telebirr H5 Pay
                </a>
                <p className="font-mono text-xs bg-stone-50 p-3 rounded-lg border border-stone-200 text-stone-600">TXID: {telebirrData.transactionId}</p>
                <button 
                  onClick={() => setTelebirrData(null)}
                  className="mt-2 text-stone-400 hover:text-stone-600 underline text-sm"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {showOcr && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-white/20">
              <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
                <h2 className="text-2xl font-bold text-stone-900">OCR Payment Verification</h2>
                <button onClick={() => setShowOcr(false)} className="p-2 hover:bg-white rounded-full transition-colors"><CloseIcon className="w-5 h-5 text-stone-400" /></button>
              </div>
              <div className="p-8">
                {!ocrPreview ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-4 border-dashed border-stone-100 rounded-3xl p-12 text-center cursor-pointer hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group"
                  >
                    <div className="w-20 h-20 bg-stone-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="w-10 h-10 text-stone-300 group-hover:text-emerald-500" />
                    </div>
                    <p className="text-stone-500 font-medium">Upload your Telebirr/CBE Birr screenshot</p>
                    <p className="text-stone-300 text-sm mt-2">Support JPG, PNG up to 10MB</p>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="relative rounded-2xl overflow-hidden border border-stone-200 shadow-sm">
                        <img src={ocrPreview} alt="Preview" className="w-full h-64 object-cover" />
                        <button onClick={() => {setOcrPreview(null); setOcrFile(null);}} className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70"><CloseIcon className="w-4 h-4" /></button>
                      </div>
                      <button 
                        onClick={handleOcrVerify}
                        disabled={loading}
                        className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all"
                      >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                        {ocrResult ? "Verify Again" : "Analyze Screenshot"}
                      </button>
                    </div>

                    <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100 min-h-[300px]">
                      <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4">Extraction Results</h3>
                      {loading ? (
                        <div className="h-40 flex flex-col items-center justify-center text-stone-400 gap-3">
                          <Loader2 className="w-8 h-8 animate-spin" />
                          <p className="text-xs animate-pulse">Running AI OCR Analysis...</p>
                        </div>
                      ) : ocrResult ? (
                        <div className="space-y-4">
                          <div className={`p-4 rounded-xl border-2 ${ocrResult.parsed?.isValid ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
                            <div className="flex items-center gap-2 mb-2">
                              {ocrResult.parsed?.isValid ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-amber-500" />}
                              <span className="font-bold text-stone-800">{ocrResult.parsed?.isValid ? "Success!" : "Low Confidence"}</span>
                            </div>
                            <p className="text-xs text-stone-500">Confidence: {Math.round(ocrResult.confidence || 0)}%</p>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <p className="text-[10px] font-bold text-stone-400 uppercase">Transaction ID</p>
                              <p className="font-mono text-sm text-stone-700">{ocrResult.parsed?.transactionId || 'Not found'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-stone-400 uppercase">Amount Extracted</p>
                              <p className="text-lg font-bold text-emerald-700">{ocrResult.parsed?.amount ? `${ocrResult.parsed.amount} ETB` : 'Not found'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-stone-400 uppercase">Date Detected</p>
                              <p className="text-sm text-stone-600">{ocrResult.parsed?.date || 'Today (Simulated)'}</p>
                            </div>
                          </div>

                          <button 
                            onClick={handleManualSubmit}
                            className="w-full mt-4 py-3 bg-stone-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-stone-800 transition-colors"
                          >
                            Submit Extracted Data
                          </button>
                        </div>
                      ) : (
                        <div className="h-40 flex flex-col items-center justify-center text-stone-300">
                          <AlertCircle className="w-10 h-10 opacity-20 mb-2" />
                          <p className="text-xs text-center">Click "Analyze" to extract payment details from your screenshot.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {showManual && (
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-8 rounded-3xl max-w-md w-full shadow-2xl border border-stone-200">
              <h2 className="text-2xl font-bold mb-2 text-stone-900">Manual Submission</h2>
              <p className="text-stone-500 mb-6 text-sm">Submit your payment details for manual verification by the organization admin.</p>
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase mb-2">Amount Paid (ETB)</label>
                  <input 
                    type="number" 
                    value={manualAmount} 
                    onChange={(e) => setManualAmount(Number(e.target.value))}
                    className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-lg"
                  />
                </div>
                <div className="pt-2">
                  <button 
                    onClick={handleManualSubmit}
                    disabled={loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <CheckCircle className="w-5 h-5" />} Submit for Approval
                  </button>
                  <button 
                    onClick={() => setShowManual(false)}
                    className="w-full text-stone-400 py-3 mt-2 text-sm font-medium hover:text-stone-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm shadow-stone-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                <th className="px-6 py-5 text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Transaction</th>
                <th className="px-6 py-5 text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Method</th>
                <th className="px-6 py-5 text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Amount</th>
                <th className="px-6 py-5 text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-stone-300">
                      <CreditCard className="w-12 h-12 opacity-20" />
                      <p className="text-sm font-medium">No payment history found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                payments.map(p => (
                  <tr key={p.id} className="hover:bg-stone-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-stone-800">{new Date(p.createdAt).toLocaleDateString()}</p>
                      <p className="text-[10px] font-mono text-stone-400">{p.transactionId || 'MANUAL-PENDING'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${p.method === 'telebirr' ? 'bg-emerald-50 text-emerald-600' : 'bg-stone-100 text-stone-500'}`}>
                          {p.method === 'telebirr' ? <Smartphone className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                        </div>
                        <span className="capitalize text-xs font-bold text-stone-600">{p.method}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-black text-stone-900">{p.amount.toLocaleString()}</span>
                      <span className="text-[10px] ml-1 text-stone-400">{p.currency}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        p.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 
                        p.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${p.status === 'completed' ? 'bg-emerald-500' : p.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'}`} />
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {isAdmin && p.status === 'pending' && (
                          <button 
                            onClick={() => confirmPayment(p.id!)}
                            disabled={confirmingId === p.id}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm shadow-emerald-100 flex items-center gap-1"
                          >
                            {confirmingId === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                            Approve
                          </button>
                        )}
                        {p.status === 'completed' ? (
                          <button 
                            onClick={() => handleDownloadInvoice(p)}
                            className="p-2 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            title="Download Invoice"
                          >
                            <FileText className="w-5 h-5" />
                          </button>
                        ) : (
                          <div className="p-2 text-stone-200"><FileText className="w-5 h-5" /></div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 p-6 bg-stone-900 rounded-3xl text-white flex flex-col md:flex-row items-center gap-6 shadow-2xl shadow-stone-200">
        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
          <AlertCircle className="w-8 h-8 text-emerald-400" />
        </div>
        <div>
          <h4 className="font-bold text-lg mb-1">Need help with payments?</h4>
          <p className="text-stone-400 text-sm">If you encounter any issues with Telebirr or manual transfers, please contact our support team with your transaction ID.</p>
        </div>
        <button className="md:ml-auto px-6 py-3 bg-white text-stone-900 rounded-xl font-bold text-sm hover:bg-emerald-50 transition-colors whitespace-nowrap">
          Support Center
        </button>
      </div>
    </div>
  );
}

// Add ShieldCheck icon to lucide-react imports if not already there
import { ShieldCheck } from 'lucide-react';

