import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import {
  CreditCard,
  Smartphone,
  Receipt,
  CheckCircle,
  Loader2,
  Upload,
  X as CloseIcon,
  Download,
  Search,
  Plus,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import api from './services';

type TabKey = 'transactions' | 'invoices' | 'receipts' | 'plans';

const Payments: React.FC = () => {
  const { user, member, isAdmin } = useAuth();
  const [tab, setTab] = useState<TabKey>('transactions');

  const [payments, setPayments] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [telebirrData, setTelebirrData] = useState<any>(null);
  const [showManual, setShowManual] = useState(false);
  const [showOcr, setShowOcr] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  const [manualAmount, setManualAmount] = useState(500);
  const [ocrFile, setOcrFile] = useState<File | null>(null);
  const [ocrPreview, setOcrPreview] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [planForm, setPlanForm] = useState({ name: '', amount: 0, interval: 'monthly' });
  const [transferForm, setTransferForm] = useState({ amount: 0, transferReference: '' });

  const fetchPayments = async () => {
    try {
      const res = await api.get('/payments', { params: { q: q || undefined, status: statusFilter || undefined } });
      setPayments((res.data || []).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch {
      console.error('Failed to fetch payments');
    }
  };

  const fetchPlans = async () => {
    if (!isAdmin) return;
    try {
      const res = await api.get('/payments/plans');
      setPlans(res.data || []);
    } catch {
      setPlans([]);
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchPlans();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchPayments();
    }, 250);
    return () => clearTimeout(timeout);
  }, [q, statusFilter]);

  const handleTelebirr = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.post('/payments/telebirr/initiate', { amount: 500, memberId: user.uid });
      setTelebirrData(res.data);

      await api.post('/payments', {
        amount: 500,
        currency: 'ETB',
        method: 'telebirr',
        transactionId: res.data.transactionId,
      });

      fetchPayments();
    } catch {
      alert('Telebirr initiation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async () => {
    setLoading(true);
    try {
      await api.post('/payments', {
        amount: manualAmount,
        currency: 'ETB',
        method: 'manual',
        transactionId: ocrResult?.parsed?.transactionId || `MANUAL-${Date.now()}`,
      });
      setShowManual(false);
      setShowOcr(false);
      setOcrResult(null);
      setOcrFile(null);
      setOcrPreview(null);
      fetchPayments();
    } catch {
      alert('Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOcrFile(file);
    setOcrPreview(URL.createObjectURL(file));
    setOcrResult(null);
  };

  const handleOcrVerify = async () => {
    if (!ocrFile) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('screenshot', ocrFile);
    try {
      const res = await api.post('/payments/ocr-verify', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setOcrResult(res.data);
      if (res.data.success && res.data.parsed?.amount) {
        setManualAmount(Number(res.data.parsed.amount));
      }
    } catch {
      alert('OCR failed');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.patch(`/payments/${id}`, { status: 'completed' });
      fetchPayments();
    } catch {
      alert('Approval failed');
    }
  };

  const downloadDoc = async (type: 'invoice' | 'receipt', paymentId: string, p: any) => {
    try {
      const res = await api.get(`/payments/${type}/${paymentId}`, {
        params: {
          memberName: member?.fullName || 'Member',
          amount: p.amount,
          date: new Date(p.createdAt).toLocaleDateString(),
          method: p.method,
          status: p.status,
          invoiceId: p.invoiceId,
          receiptId: p.receiptId,
        },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}-${paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch {
      alert(`Failed to download ${type}`);
    }
  };

  const createPlan = async () => {
    try {
      await api.post('/payments/plans', planForm);
      setShowPlanModal(false);
      setPlanForm({ name: '', amount: 0, interval: 'monthly' });
      fetchPlans();
    } catch {
      alert('Failed to create plan');
    }
  };

  const recordTransfer = async () => {
    try {
      await api.post('/payments/transfer', transferForm);
      setShowTransferModal(false);
      setTransferForm({ amount: 0, transferReference: '' });
      fetchPayments();
    } catch {
      alert('Failed to record transfer');
    }
  };

  const filteredInvoices = payments.filter((p) => !!p.invoiceId);
  const filteredReceipts = payments.filter((p) => !!p.receiptId || p.status === 'completed');

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 text-stone-900">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments, Invoices & Subscriptions</h1>
          <p className="text-stone-500 text-sm mt-1">Transactions, plan management, transfers, and financial documents.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowOcr(true)} className="px-3 py-2 bg-stone-100 rounded-lg text-sm font-medium"><Upload className="w-4 h-4 inline mr-1" /> OCR</button>
          <button onClick={() => setShowManual(true)} className="px-3 py-2 bg-stone-100 rounded-lg text-sm font-medium"><Receipt className="w-4 h-4 inline mr-1" /> Manual</button>
          {isAdmin && <button onClick={() => setShowTransferModal(true)} className="px-3 py-2 bg-stone-100 rounded-lg text-sm font-medium">Record Transfer</button>}
          {isAdmin && <button onClick={() => setShowPlanModal(true)} className="px-3 py-2 bg-stone-100 rounded-lg text-sm font-medium"><Plus className="w-4 h-4 inline mr-1" /> Plan</button>}
          <button onClick={handleTelebirr} disabled={loading} className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold">
            {loading ? <Loader2 className="w-4 h-4 inline mr-1 animate-spin" /> : <Smartphone className="w-4 h-4 inline mr-1" />} Telebirr
          </button>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl p-3 mb-4 flex flex-wrap gap-2">
        {(['transactions', 'invoices', 'receipts', 'plans'] as TabKey[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-3 py-2 rounded-xl text-xs font-bold uppercase ${tab === t ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab !== 'plans' && (
        <div className="bg-white border border-stone-200 rounded-2xl p-4 mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search transaction/method" className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 text-sm" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-xl border border-stone-200 text-sm">
            <option value="">All status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      )}

      {telebirrData && (
        <div className="bg-white p-6 rounded-2xl border border-emerald-200 mb-6 text-center">
          <h3 className="font-bold mb-2">Complete Telebirr Payment</h3>
          <div className="inline-block bg-white p-4 rounded-xl border border-stone-100"><QRCodeSVG value={telebirrData.qrCode} size={180} /></div>
          <p className="text-xs text-stone-500 mt-3">TXID: {telebirrData.transactionId}</p>
        </div>
      )}

      {tab === 'transactions' && (
        <TransactionTable data={payments} isAdmin={isAdmin} onApprove={handleApprove} onDownloadInvoice={(p) => downloadDoc('invoice', p.id, p)} onDownloadReceipt={(p) => downloadDoc('receipt', p.id, p)} />
      )}
      {tab === 'invoices' && (
        <TransactionTable data={filteredInvoices} isAdmin={isAdmin} onApprove={handleApprove} onDownloadInvoice={(p) => downloadDoc('invoice', p.id, p)} onDownloadReceipt={(p) => downloadDoc('receipt', p.id, p)} />
      )}
      {tab === 'receipts' && (
        <TransactionTable data={filteredReceipts} isAdmin={isAdmin} onApprove={handleApprove} onDownloadInvoice={(p) => downloadDoc('invoice', p.id, p)} onDownloadReceipt={(p) => downloadDoc('receipt', p.id, p)} />
      )}
      {tab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.length === 0 && <div className="text-sm text-stone-500">No plans configured.</div>}
          {plans.map((plan) => (
            <div key={plan.id} className="bg-white border border-stone-200 rounded-2xl p-4">
              <p className="text-lg font-bold">{plan.name}</p>
              <p className="text-sm text-stone-500">{plan.amount} ETB / {plan.interval}</p>
              <p className="text-xs uppercase font-black mt-2 text-stone-500">{plan.status}</p>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showOcr && (
          <Modal title="OCR Payment Verification" onClose={() => setShowOcr(false)}>
            {!ocrPreview ? (
              <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-stone-300 rounded-2xl p-10 text-center cursor-pointer">
                Upload receipt screenshot
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              </div>
            ) : (
              <div className="space-y-4">
                <img src={ocrPreview} className="w-full max-h-64 object-cover rounded-xl border border-stone-200" alt="Receipt" />
                <button onClick={handleOcrVerify} className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold">Extract Details</button>
                {ocrResult && <button onClick={handleManualSubmit} className="px-4 py-2 bg-stone-900 text-white rounded-xl font-bold">Submit Analysis</button>}
              </div>
            )}
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showManual && (
          <Modal title="Manual Submission" onClose={() => setShowManual(false)}>
            <div className="space-y-3">
              <input type="number" value={manualAmount} onChange={(e) => setManualAmount(Number(e.target.value))} className="w-full border border-stone-200 rounded-xl p-3" />
              <button onClick={handleManualSubmit} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold">Submit</button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPlanModal && (
          <Modal title="Create Plan" onClose={() => setShowPlanModal(false)}>
            <div className="space-y-3">
              <input placeholder="Plan name" value={planForm.name} onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })} className="w-full border border-stone-200 rounded-xl p-3" />
              <input type="number" placeholder="Amount" value={planForm.amount} onChange={(e) => setPlanForm({ ...planForm, amount: Number(e.target.value) })} className="w-full border border-stone-200 rounded-xl p-3" />
              <select value={planForm.interval} onChange={(e) => setPlanForm({ ...planForm, interval: e.target.value })} className="w-full border border-stone-200 rounded-xl p-3">
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
              <button onClick={createPlan} className="w-full bg-stone-900 text-white py-3 rounded-xl font-bold">Create</button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTransferModal && (
          <Modal title="Record Transfer" onClose={() => setShowTransferModal(false)}>
            <div className="space-y-3">
              <input type="number" placeholder="Amount" value={transferForm.amount} onChange={(e) => setTransferForm({ ...transferForm, amount: Number(e.target.value) })} className="w-full border border-stone-200 rounded-xl p-3" />
              <input placeholder="Transfer reference" value={transferForm.transferReference} onChange={(e) => setTransferForm({ ...transferForm, transferReference: e.target.value })} className="w-full border border-stone-200 rounded-xl p-3" />
              <button onClick={recordTransfer} className="w-full bg-stone-900 text-white py-3 rounded-xl font-bold">Record</button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

const TransactionTable = ({ data, isAdmin, onApprove, onDownloadInvoice, onDownloadReceipt }: any) => (
  <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-stone-50 border-b border-stone-100">
          <tr>
            <th className="px-4 py-3 text-xs uppercase">Date</th>
            <th className="px-4 py-3 text-xs uppercase">Method</th>
            <th className="px-4 py-3 text-xs uppercase">Amount</th>
            <th className="px-4 py-3 text-xs uppercase">Status</th>
            <th className="px-4 py-3 text-xs uppercase">Links</th>
            <th className="px-4 py-3 text-xs uppercase text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {data.map((p: any) => (
            <tr key={p.id}>
              <td className="px-4 py-3 text-sm">{new Date(p.createdAt).toLocaleDateString()}</td>
              <td className="px-4 py-3 text-sm">{p.method}</td>
              <td className="px-4 py-3 text-sm font-bold">{p.amount} ETB</td>
              <td className="px-4 py-3 text-sm">{p.status}</td>
              <td className="px-4 py-3 text-xs">{p.invoiceId || '-'} / {p.receiptId || '-'}</td>
              <td className="px-4 py-3 text-right space-x-2">
                {isAdmin && p.status === 'pending' ? <button onClick={() => onApprove(p.id)} className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs font-bold">Approve</button> : null}
                <button onClick={() => onDownloadInvoice(p)} className="px-2 py-1 bg-stone-100 text-stone-700 rounded text-xs font-bold"><Download className="w-3 h-3 inline mr-1" />Invoice</button>
                {p.status === 'completed' ? <button onClick={() => onDownloadReceipt(p)} className="px-2 py-1 bg-stone-100 text-stone-700 rounded text-xs font-bold"><Download className="w-3 h-3 inline mr-1" />Receipt</button> : null}
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-sm text-stone-500">No records found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const Modal = ({ title, onClose, children }: any) => (
  <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-6 rounded-2xl max-w-lg w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{title}</h2>
        <button onClick={onClose} className="p-2 rounded-lg bg-stone-100"><CloseIcon className="w-4 h-4" /></button>
      </div>
      {children}
    </motion.div>
  </div>
);

export default Payments;
