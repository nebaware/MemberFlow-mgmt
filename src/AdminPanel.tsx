import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from './firebase';
import { collection, query, onSnapshot, doc, getDoc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { OrganizationConfig, CustomAttributeDefinition, Member, Payment } from './types';
import { Settings, Plus, Trash2, Save, Loader2, Users, CheckCircle, XCircle, TrendingUp, CreditCard, Clock, ShieldCheck, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';

export default function AdminPanel() {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'members' | 'settings' | 'reports'>('members');
  const [config, setConfig] = useState<OrganizationConfig | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    pendingMembers: 0,
    totalRevenue: 0,
    pendingPayments: 0
  });

  useEffect(() => {
    if (!isAdmin) return;

    // Fetch Config
    const fetchConfig = async () => {
      const docRef = doc(db, 'config', 'org');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setConfig(snap.data() as OrganizationConfig);
      } else {
        const defaultConfig: OrganizationConfig = { name: "MemberFlow Organization", customAttributeDefinitions: [] };
        await setDoc(docRef, defaultConfig);
        setConfig(defaultConfig);
      }
    };
    fetchConfig();

    // Listen to Members
    const qMembers = collection(db, 'members');
    const unsubMembers = onSnapshot(qMembers, (snapshot) => {
      const mList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Member));
      setMembers(mList);
      
      const active = mList.filter(m => m.status === 'active').length;
      const pending = mList.filter(m => m.status === 'pending').length;
      setStats(prev => ({ ...prev, totalMembers: mList.length, activeMembers: active, pendingMembers: pending }));
    });

    // Listen to Payments
    const qPayments = collection(db, 'payments');
    const unsubPayments = onSnapshot(qPayments, (snapshot) => {
      const pList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Payment));
      setPayments(pList);
      
      const revenue = pList.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
      const pending = pList.filter(p => p.status === 'pending').length;
      setStats(prev => ({ ...prev, totalRevenue: revenue, pendingPayments: pending }));
    });

    setLoading(false);
    return () => {
      unsubMembers();
      unsubPayments();
    };
  }, [isAdmin]);

  // --- Member Actions ---
  const updateMemberStatus = async (uid: string, status: Member['status']) => {
    try {
      await updateDoc(doc(db, 'members', uid), { status });
    } catch (err) {
      console.error("Error updating member:", err);
    }
  };

  const deleteMember = async (uid: string) => {
    if (!window.confirm("Are you sure you want to delete this member?")) return;
    try {
      await deleteDoc(doc(db, 'members', uid));
    } catch (err) {
      console.error("Error deleting member:", err);
    }
  };

  // --- Attribute Actions ---
  const addAttribute = () => {
    if (!config) return;
    const newAttr: CustomAttributeDefinition = {
      name: `attr_${Date.now()}`,
      label: "New Attribute",
      type: "text"
    };
    setConfig({ ...config, customAttributeDefinitions: [...config.customAttributeDefinitions, newAttr] });
  };

  const updateAttribute = (index: number, updates: Partial<CustomAttributeDefinition>) => {
    if (!config) return;
    const newAttrs = [...config.customAttributeDefinitions];
    newAttrs[index] = { ...newAttrs[index], ...updates };
    setConfig({ ...config, customAttributeDefinitions: newAttrs });
  };

  const removeAttribute = (index: number) => {
    if (!config) return;
    const newAttrs = config.customAttributeDefinitions.filter((_, i) => i !== index);
    setConfig({ ...config, customAttributeDefinitions: newAttrs });
  };

  const saveConfig = async () => {
    if (!config || !isAdmin) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'config', 'org'), config as any);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-emerald-600" /></div>;
  if (!isAdmin) return <div className="p-8 text-center text-red-500 font-bold bg-red-50 rounded-2xl border border-red-100 max-w-md mx-auto mt-20">Access Denied: Admin Privileges Required</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-stone-900 tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-10 h-10 text-emerald-600" /> Administrative Hub
          </h1>
          <p className="text-stone-500 mt-2 font-medium">System control, member oversight, and platform configuration</p>
        </div>
        
        <div className="flex bg-stone-100 p-1.5 rounded-2xl border border-stone-200 shadow-inner w-full md:w-auto overflow-x-auto">
          {[
            { id: 'members', label: 'Members', icon: Users },
            { id: 'settings', label: 'Organization', icon: Settings },
            { id: 'reports', label: 'Financials', icon: TrendingUp },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all whitespace-nowrap font-bold text-sm ${
                activeTab === tab.id 
                  ? 'bg-white text-emerald-700 shadow-md ring-1 ring-stone-200' 
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'members' && (
          <motion.div key="members" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
            {/* Stats Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Members" value={stats.totalMembers} icon={Users} color="stone" />
              <StatCard label="Active" value={stats.activeMembers} icon={CheckCircle} color="emerald" />
              <StatCard label="Pending" value={stats.pendingMembers} icon={Clock} color="amber" />
              <StatCard label="Revenue (ETB)" value={stats.totalRevenue.toLocaleString()} icon={TrendingUp} color="emerald" border />
            </div>

            <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center">
                <h3 className="font-bold text-stone-800">Membership Directory</h3>
                <div className="flex gap-2">
                   <div className="relative">
                      <input type="text" placeholder="Search members..." className="pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all w-64" />
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                   </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-stone-50/80 text-[10px] uppercase tracking-[0.2em] font-black text-stone-400">
                    <tr>
                      <th className="px-6 py-4">Profile</th>
                      <th className="px-6 py-4">Fayda ID</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Joined</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50 font-medium">
                    {members.map(m => (
                      <tr key={m.uid} className="hover:bg-stone-50/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-500 font-bold uppercase">
                              {m.fullName.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-stone-900">{m.fullName}</p>
                              <p className="text-xs text-stone-400">{m.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs bg-stone-100 px-2 py-1 rounded text-stone-600">{m.faydaId || 'N/A'}</span>
                          {m.faydaVerified && <ShieldCheck className="w-3 h-3 text-emerald-500 inline ml-1" />}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            m.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 
                            m.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${m.status === 'active' ? 'bg-emerald-500' : m.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'}`} />
                            {m.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-stone-500">
                          {new Date(m.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {m.status === 'pending' && (
                              <button onClick={() => updateMemberStatus(m.uid, 'active')} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Approve Member">
                                <UserCheck className="w-5 h-5" />
                              </button>
                            )}
                            {m.status === 'active' && (
                              <button onClick={() => updateMemberStatus(m.uid, 'suspended')} className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Suspend Member">
                                <XCircle className="w-5 h-5" />
                              </button>
                            )}
                            {m.status === 'suspended' && (
                              <button onClick={() => updateMemberStatus(m.uid, 'active')} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Reactivate Member">
                                <CheckCircle className="w-5 h-5" />
                              </button>
                            )}
                            <button onClick={() => deleteMember(m.uid)} className="p-2 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Member">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
           <motion.div key="settings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="bg-stone-900 text-white p-10 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
                <div className="relative z-10 max-w-lg">
                  <h2 className="text-3xl font-black mb-4">Organization Identity</h2>
                  <p className="text-stone-400 mb-8 font-medium">Define custom attributes and identifiers required for members to join your specific organization.</p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-2">Organization Name</label>
                      <input 
                        value={config?.name || ''} 
                        onChange={(e) => setConfig({ ...config!, name: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-xl placeholder:text-white/20"
                        placeholder="Organization Name"
                      />
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-600/20 rounded-full -mr-20 -mt-20 blur-3xl" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {config?.customAttributeDefinitions.map((attr, index) => (
                  <motion.div 
                    layout
                    key={attr.name} 
                    className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow relative group"
                  >
                    <button onClick={() => removeAttribute(index)} className="absolute top-4 right-4 p-2 text-stone-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Field Label</label>
                        <input value={attr.label} onChange={(e) => updateAttribute(index, { label: e.target.value })} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-stone-800" />
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Type</label>
                          <select value={attr.type} onChange={(e) => updateAttribute(index, { type: e.target.value as any })} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-stone-800 text-sm">
                            <option value="text">Text</option>
                            <option value="number">Number</option>
                            <option value="date">Date</option>
                            <option value="select">Selection</option>
                          </select>
                        </div>
                      </div>
                      {attr.type === 'select' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                          <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Dropdown Options</label>
                          <input 
                            value={attr.options?.join(', ') || ''} 
                            onChange={(e) => updateAttribute(index, { options: e.target.value.split(',').map(s => s.trim()) })} 
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2 text-sm" 
                            placeholder="Option 1, Option 2, ..."
                          />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
                
                <button 
                  onClick={addAttribute}
                  className="h-full min-h-[220px] rounded-3xl border-4 border-dashed border-stone-100 flex flex-col items-center justify-center gap-3 text-stone-400 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all group"
                >
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Plus className="w-6 h-6" />
                  </div>
                  <span className="font-black text-xs uppercase tracking-widest">New Field</span>
                </button>
              </div>

              <div className="flex justify-end pt-4">
                <button 
                  onClick={saveConfig}
                  disabled={saving}
                  className="flex items-center gap-3 px-10 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-emerald-200 active:scale-95 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />} Save Organization Profile
                </button>
              </div>
           </motion.div>
        )}

        {activeTab === 'reports' && (
          <motion.div key="reports" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[2.5rem] border border-stone-200 shadow-sm relative overflow-hidden">
                <div className="relative z-10 text-center py-10">
                  <p className="text-stone-400 font-black uppercase text-xs tracking-widest mb-2">Total Platform Revenue</p>
                  <h3 className="text-6xl font-black text-stone-900 tracking-tighter mb-4">{stats.totalRevenue.toLocaleString()}<span className="text-2xl text-stone-400 ml-2">ETB</span></h3>
                  <div className="flex justify-center items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-full w-fit mx-auto border border-emerald-100">
                    <TrendingUp className="w-4 h-4" /> 12% Growth this month
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-2 bg-emerald-500" />
              </div>

              <div className="bg-white rounded-[2.5rem] border border-stone-200 shadow-sm flex flex-col justify-center p-8">
                <h4 className="font-bold text-stone-800 mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-500" /> Recent Activity
                </h4>
                <div className="space-y-4">
                   {payments.slice(0, 5).map(p => (
                     <div key={p.id} className="flex items-center justify-between py-3 border-b border-stone-50 last:border-0">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 bg-stone-50 rounded-lg flex items-center justify-center">
                              <CreditCard className="w-4 h-4 text-stone-400" />
                           </div>
                           <div>
                              <p className="text-sm font-bold text-stone-700">{p.amount} ETB</p>
                              <p className="text-[10px] text-stone-400 uppercase font-black">{p.method}</p>
                           </div>
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${p.status === 'completed' ? 'text-emerald-500' : 'text-amber-500'}`}>
                           {p.status}
                        </span>
                     </div>
                   ))}
                </div>
              </div>
            </div>

            <div className="bg-emerald-900 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                 <ReportMiniStat label="Transaction Volume" value="482" />
                 <ReportMiniStat label="Member Retention" value="98.2%" />
                 <ReportMiniStat label="Pending Audits" value={stats.pendingPayments.toString()} />
              </div>
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-800 via-transparent to-transparent opacity-50" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, border }: any) {
  const colors: any = {
    stone: 'bg-stone-50 text-stone-600 border-stone-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
  };
  return (
    <div className={`p-6 rounded-3xl border ${border ? 'border-stone-900 border-2' : 'border-stone-200'} bg-white shadow-sm flex items-center gap-4`}>
       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colors[color] || colors.stone}`}>
          <Icon className="w-6 h-6" />
       </div>
       <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-0.5">{label}</p>
          <p className="text-2xl font-black text-stone-900 tracking-tight">{value}</p>
       </div>
    </div>
  );
}

function ReportMiniStat({ label, value }: any) {
  return (
    <div className="text-center md:text-left">
       <p className="text-emerald-400 font-black uppercase text-[10px] tracking-[0.3em] mb-2">{label}</p>
       <p className="text-5xl font-black">{value}</p>
    </div>
  );
}
