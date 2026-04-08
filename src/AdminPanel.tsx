import React, { useState, useEffect } from 'react';
import { Users, Search, Download, Plus, Pencil, Trash2, MessageSquare, Upload, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import api from './services';

const emptyMember = {
  fullName: '',
  email: '',
  phoneNumber: '',
  status: 'pending',
};

const AdminPanel: React.FC = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'members' | 'settings' | 'reports'>('members');

  const [showEditor, setShowEditor] = useState(false);
  const [editingUid, setEditingUid] = useState<string | null>(null);
  const [memberForm, setMemberForm] = useState<any>(emptyMember);

  const [selectedUids, setSelectedUids] = useState<string[]>([]);
  const [showImport, setShowImport] = useState(false);
  const [importJson, setImportJson] = useState('[\n  {"fullName":"","email":"","phoneNumber":""}\n]');

  const fetchData = async () => {
    try {
      const [membersRes, paymentsRes, configRes] = await Promise.all([api.get('/members'), api.get('/payments'), api.get('/config')]);
      setMembers(membersRes.data || []);
      setPayments(paymentsRes.data || []);
      setConfig(configRes.data || { customAttributeDefinitions: [] });
    } catch {
      console.error('Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredMembers = members.filter((m) => `${m.fullName} ${m.email}`.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleStatusChange = async (uid: string, newStatus: string) => {
    try {
      await api.patch(`/members/${uid}`, { status: newStatus });
      fetchData();
    } catch {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (uid: string) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    try {
      await api.delete(`/members/${uid}`);
      fetchData();
    } catch {
      alert('Failed to delete member');
    }
  };

  const openCreate = () => {
    setEditingUid(null);
    setMemberForm(emptyMember);
    setShowEditor(true);
  };

  const openEdit = (m: any) => {
    setEditingUid(m.uid);
    setMemberForm({
      fullName: m.fullName || '',
      email: m.email || '',
      phoneNumber: m.phoneNumber || '',
      status: m.status || 'pending',
    });
    setShowEditor(true);
  };

  const saveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUid) {
        await api.patch(`/members/${editingUid}`, memberForm);
      } else {
        await api.post('/members', memberForm);
      }
      setShowEditor(false);
      setEditingUid(null);
      setMemberForm(emptyMember);
      fetchData();
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to save member');
    }
  };

  const toggleSelection = (uid: string) => {
    setSelectedUids((prev) => (prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]));
  };

  const runBulkStatus = async (status: string) => {
    if (selectedUids.length === 0) return;
    try {
      await api.post('/members/bulk', { uids: selectedUids, action: 'status', status });
      setSelectedUids([]);
      fetchData();
    } catch {
      alert('Bulk action failed');
    }
  };

  const runBulkDelete = async () => {
    if (selectedUids.length === 0) return;
    if (!window.confirm(`Delete ${selectedUids.length} members?`)) return;
    try {
      await api.post('/members/bulk', { uids: selectedUids, action: 'delete' });
      setSelectedUids([]);
      fetchData();
    } catch {
      alert('Bulk delete failed');
    }
  };

  const exportMembers = async () => {
    try {
      const res = await api.get('/members/export');
      const blob = new Blob([JSON.stringify(res.data?.members || [], null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'members-export.json';
      a.click();
    } catch {
      alert('Export failed');
    }
  };

  const importMembers = async () => {
    try {
      const parsed = JSON.parse(importJson);
      await api.post('/members/import', { members: parsed });
      setShowImport(false);
      fetchData();
    } catch {
      alert('Import failed. Provide valid JSON array.');
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      await api.post('/config', config);
      alert('Organization profile updated');
    } catch {
      alert('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const addAttribute = () => {
    const newAttr = { name: `attr_${Date.now()}`, label: 'New Attribute', type: 'text' };
    setConfig({ ...config, customAttributeDefinitions: [...(config.customAttributeDefinitions || []), newAttr] });
  };

  const updateAttribute = (index: number, updates: any) => {
    const newAttrs = [...(config.customAttributeDefinitions || [])];
    newAttrs[index] = { ...newAttrs[index], ...updates };
    setConfig({ ...config, customAttributeDefinitions: newAttrs });
  };

  const removeAttribute = (index: number) => {
    const newAttrs = (config.customAttributeDefinitions || []).filter((_: any, i: number) => i !== index);
    setConfig({ ...config, customAttributeDefinitions: newAttrs });
  };

  const stats = {
    total: members.length,
    active: members.filter((m) => m.status === 'active').length,
    pending: members.filter((m) => m.status === 'pending').length,
    revenue: payments.filter((p) => p.status === 'completed').reduce((sum, p) => sum + Number(p.amount || 0), 0),
  };

  if (loading) return <div className="p-8 text-center text-stone-400">Loading Admin Hub...</div>;

  return (
    <div className="space-y-8 text-stone-900">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Administrative Hub</h2>
          <p className="text-stone-500 text-sm mt-1">Members, settings, and financial snapshots.</p>
        </div>

        <div className="flex bg-stone-100 p-1.5 rounded-2xl border border-stone-200">
          <TabButton active={activeTab === 'members'} onClick={() => setActiveTab('members')} label="Members" />
          <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} label="Organization" />
          <TabButton active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} label="Financials" />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'members' && (
          <motion.div key="members" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total" value={stats.total} />
              <StatCard label="Active" value={stats.active} />
              <StatCard label="Pending" value={stats.pending} />
              <StatCard label="Revenue ETB" value={stats.revenue.toLocaleString()} />
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 p-4 flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input type="text" placeholder="Search members..." className="w-full border border-stone-200 rounded-xl py-2 pl-10 pr-4 text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <button onClick={openCreate} className="px-3 py-2 rounded-xl bg-stone-900 text-white text-sm font-bold"><Plus className="w-4 h-4 inline mr-1" /> Add</button>
              <button onClick={exportMembers} className="px-3 py-2 rounded-xl bg-stone-100 text-stone-700 text-sm font-bold"><Download className="w-4 h-4 inline mr-1" /> Export</button>
              <button onClick={() => setShowImport(true)} className="px-3 py-2 rounded-xl bg-stone-100 text-stone-700 text-sm font-bold"><Upload className="w-4 h-4 inline mr-1" /> Import</button>
              <button onClick={() => runBulkStatus('active')} disabled={!selectedUids.length} className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-bold disabled:opacity-50">Bulk Activate</button>
              <button onClick={() => runBulkStatus('suspended')} disabled={!selectedUids.length} className="px-3 py-2 rounded-xl bg-amber-50 text-amber-700 text-sm font-bold disabled:opacity-50">Bulk Suspend</button>
              <button onClick={runBulkDelete} disabled={!selectedUids.length} className="px-3 py-2 rounded-xl bg-red-50 text-red-700 text-sm font-bold disabled:opacity-50">Bulk Delete</button>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-stone-50 text-[10px] uppercase tracking-[0.2em] font-black text-stone-400">
                    <tr>
                      <th className="px-4 py-3"><input type="checkbox" checked={selectedUids.length > 0 && selectedUids.length === filteredMembers.length} onChange={(e) => setSelectedUids(e.target.checked ? filteredMembers.map((m) => m.uid) : [])} /></th>
                      <th className="px-4 py-3">Profile</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Joined</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredMembers.map((m) => (
                      <tr key={m.uid} className="hover:bg-stone-50/30">
                        <td className="px-4 py-3"><input type="checkbox" checked={selectedUids.includes(m.uid)} onChange={() => toggleSelection(m.uid)} /></td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-bold">{m.fullName}</p>
                          <p className="text-xs text-stone-400">{m.email}</p>
                        </td>
                        <td className="px-4 py-3 text-xs font-bold uppercase">{m.status}</td>
                        <td className="px-4 py-3 text-xs text-stone-500">{m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '-'}</td>
                        <td className="px-4 py-3 text-right space-x-1">
                          <button onClick={() => handleStatusChange(m.uid, m.status === 'active' ? 'suspended' : 'active')} className="px-2 py-1 rounded bg-stone-100 text-stone-700 text-xs font-bold">{m.status === 'active' ? 'Suspend' : 'Activate'}</button>
                          <button onClick={() => window.open(`mailto:${m.email}`, '_blank')} className="p-2 rounded bg-stone-100 text-stone-700" title="Message"><MessageSquare className="w-4 h-4" /></button>
                          <button onClick={() => openEdit(m)} className="p-2 rounded bg-stone-100 text-stone-700" title="Edit"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(m.uid)} className="p-2 rounded bg-red-50 text-red-700" title="Delete"><Trash2 className="w-4 h-4" /></button>
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
          <motion.div key="settings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-stone-200">
              <h3 className="text-2xl font-black mb-4">Organization Identity</h3>
              <input value={config?.name || ''} onChange={(e) => setConfig({ ...config, name: e.target.value })} className="w-full border border-stone-200 rounded-xl px-4 py-3 mb-3" placeholder="Organization name" />
              <textarea value={config?.description || ''} onChange={(e) => setConfig({ ...config, description: e.target.value })} className="w-full border border-stone-200 rounded-xl px-4 py-3 h-24" placeholder="Organization description" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(config?.customAttributeDefinitions || []).map((attr: any, index: number) => (
                <div key={attr.name || index} className="bg-white p-4 rounded-2xl border border-stone-200 space-y-2">
                  <input value={attr.label} onChange={(e) => updateAttribute(index, { label: e.target.value })} className="w-full border border-stone-200 rounded-lg px-3 py-2" />
                  <select value={attr.type} onChange={(e) => updateAttribute(index, { type: e.target.value })} className="w-full border border-stone-200 rounded-lg px-3 py-2">
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="select">Dropdown</option>
                  </select>
                  <button onClick={() => removeAttribute(index)} className="text-xs text-red-600 font-bold">Remove</button>
                </div>
              ))}
              <button onClick={addAttribute} className="border-2 border-dashed border-stone-300 rounded-2xl flex items-center justify-center p-6 text-stone-500 font-bold">
                <Plus className="w-5 h-5 mr-1" /> Add Field
              </button>
            </div>

            <div className="flex justify-end">
              <button onClick={saveConfig} disabled={saving} className="bg-stone-900 text-white px-6 py-3 rounded-xl font-bold">
                {saving ? <Loader2 className="w-4 h-4 inline mr-1 animate-spin" /> : null} Save Organization Profile
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === 'reports' && (
          <motion.div key="reports" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 text-center">
              <p className="text-stone-400 uppercase text-xs font-black tracking-widest mb-1">Total Revenue</p>
              <h3 className="text-5xl font-black">{stats.revenue.toLocaleString()} ETB</h3>
            </div>
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
              <div className="p-4 border-b border-stone-100 text-xs font-black uppercase tracking-widest text-stone-400">Recent Payments</div>
              <div className="divide-y divide-stone-100">
                {payments.slice(0, 8).map((p) => (
                  <div key={p.id} className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-bold">{p.amount} ETB</p>
                      <p className="text-xs text-stone-500">{p.method}</p>
                    </div>
                    <span className="text-xs font-black uppercase text-stone-500">{p.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEditor && (
          <div className="fixed inset-0 bg-stone-900/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="bg-white rounded-2xl p-6 w-full max-w-lg">
              <h3 className="text-xl font-black mb-4">{editingUid ? 'Edit Member' : 'Add Member'}</h3>
              <form onSubmit={saveMember} className="space-y-3">
                <input required value={memberForm.fullName} onChange={(e) => setMemberForm({ ...memberForm, fullName: e.target.value })} className="w-full border border-stone-200 rounded-xl p-3" placeholder="Full name" />
                <input required type="email" value={memberForm.email} onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })} className="w-full border border-stone-200 rounded-xl p-3" placeholder="Email" />
                <input value={memberForm.phoneNumber} onChange={(e) => setMemberForm({ ...memberForm, phoneNumber: e.target.value })} className="w-full border border-stone-200 rounded-xl p-3" placeholder="Phone" />
                <select value={memberForm.status} onChange={(e) => setMemberForm({ ...memberForm, status: e.target.value })} className="w-full border border-stone-200 rounded-xl p-3">
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="rejected">Rejected</option>
                </select>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowEditor(false)} className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 font-bold">Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded-xl bg-stone-900 text-white font-bold">Save</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showImport && (
          <div className="fixed inset-0 bg-stone-900/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-white rounded-2xl p-6 w-full max-w-2xl">
              <h3 className="text-xl font-black mb-4">Import Members (JSON)</h3>
              <textarea value={importJson} onChange={(e) => setImportJson(e.target.value)} className="w-full h-56 border border-stone-200 rounded-xl p-3 font-mono text-xs" />
              <div className="flex justify-end gap-2 mt-3">
                <button onClick={() => setShowImport(false)} className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 font-bold">Cancel</button>
                <button onClick={importMembers} className="px-4 py-2 rounded-xl bg-stone-900 text-white font-bold">Import</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

function TabButton({ active, onClick, label }: any) {
  return (
    <button onClick={onClick} className={`px-4 py-2 rounded-xl text-xs font-bold ${active ? 'bg-white text-stone-900 border border-stone-200' : 'text-stone-500'}`}>
      {label}
    </button>
  );
}

function StatCard({ label, value }: any) {
  return (
    <div className="p-4 bg-white rounded-2xl border border-stone-200">
      <p className="text-[10px] font-black uppercase text-stone-400 tracking-widest">{label}</p>
      <p className="text-2xl font-black text-stone-900">{value}</p>
    </div>
  );
}

export default AdminPanel;
