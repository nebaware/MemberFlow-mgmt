import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, TrendingUp, Activity, 
  Settings, ShieldCheck, Globe, LogOut, Search,
  Plus, MoreVertical, Trash2, Edit3, CheckCircle, XCircle,
  X, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import api from './services';
import { useAuth } from './AuthContext';

export default function SuperAdminDashboard() {
  const { logout } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [orgs, setOrgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [newOrg, setNewOrg] = useState({ name: '', slug: '', description: '' });
  const [editingOrg, setEditingOrg] = useState<any | null>(null);
  const pageSize = 5;

  const fetchStats = async () => {
    try {
      const [statsRes, orgsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/organizations')
      ]);
      setStats(statsRes.data);
      setOrgs(orgsRes.data);
    } catch (err) {
      console.error("Failed to load global data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/organizations', newOrg);
      setShowAdd(false);
      setNewOrg({ name: '', slug: '', description: '' });
      fetchStats();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to create organization");
    }
  };

  const handleOrgStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
      await api.patch(`/organizations/${id}`, { status: newStatus });
      fetchStats();
    } catch (err) {
      alert("Failed to update organization status");
    }
  };

  const handleEditOrg = (org: any) => {
    setEditingOrg({ ...org });
    setShowEdit(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrg) return;
    try {
      await api.patch(`/organizations/${editingOrg.id}`, {
        name: editingOrg.name,
        slug: editingOrg.slug,
        description: editingOrg.description,
        status: editingOrg.status,
      });
      setShowEdit(false);
      setEditingOrg(null);
      fetchStats();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update organization');
    }
  };

  const handleDeleteOrg = async (id: string, name: string) => {
    if (!window.confirm(`Delete ${name}? This removes related organization data.`)) return;
    try {
      await api.delete(`/organizations/${id}`);
      fetchStats();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete organization');
    }
  };

  const filteredOrgs = orgs.filter((org) => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) || org.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' ? true : org.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredOrgs.length / pageSize));
  const pagedOrgs = filteredOrgs.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter]);

  if (loading) return <div className="p-12 text-center text-stone-400 font-bold uppercase tracking-widest animate-pulse">Initiating Global Command...</div>;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans">
      <nav className="bg-white border-b border-stone-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-black tracking-tight">OMMS SuperAdmin</h1>
        </div>
        <button onClick={logout} className="p-2 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-red-500 transition-all"><LogOut className="w-5 h-5" /></button>
      </nav>

      <main className="p-8 max-w-7xl mx-auto space-y-10">
        <header>
          <h2 className="text-4xl font-black tracking-tighter">System Overview</h2>
          <p className="text-stone-500 mt-2">Manage all active organizations, monitor platform-wide revenue, and system health.</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Total Organizations" value={stats?.totalOrganizations} icon={Building2} color="stone" />
          <StatCard label="Active Platform Users" value={stats?.activeUserCount} icon={Users} color="emerald" />
          <StatCard label="Global Revenue (ETB)" value={stats?.totalRevenue?.toLocaleString()} icon={TrendingUp} color="emerald" highlight />
          <StatCard label="System Uptime" value="99.9%" icon={Activity} color="stone" />
        </section>

        <section className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
            <h3 className="text-2xl font-bold tracking-tight">Organization Directory</h3>
            <div className="flex gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input placeholder="Search orgs..." className="w-full bg-white border border-stone-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as 'all' | 'active' | 'suspended')}
                className="bg-white border border-stone-200 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
              <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-stone-900 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-stone-800 transition-all shadow-lg active:scale-95">
                <Plus className="w-4 h-4" /> Add Organization
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-stone-50 text-[10px] uppercase font-black tracking-widest text-stone-400">
                <tr>
                  <th className="px-6 py-5">Organization</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5">Active Members</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {pagedOrgs.map(org => {
                  const orgStat = stats?.orgStats?.find((s: any) => s.id === org.id);
                  return (
                    <tr key={org.id} className="hover:bg-stone-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-stone-800">{org.name}</div>
                        <div className="text-xs text-stone-400">slug: {org.slug}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          org.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {org.status === 'active' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {org.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-stone-600">{orgStat?.memberCount || 0}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => handleOrgStatus(org.id, org.status)} title="Toggle Status" className="p-2 hover:bg-white rounded-lg transition-colors text-stone-400 hover:text-stone-900"><Activity className="w-5 h-5" /></button>
                          <button onClick={() => handleEditOrg(org)} className="p-2 hover:bg-white rounded-lg transition-colors text-stone-400 hover:text-stone-900"><Edit3 className="w-5 h-5" /></button>
                          <button onClick={() => handleDeleteOrg(org.id, org.name)} className="p-2 hover:bg-white rounded-lg transition-colors text-stone-400 hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {pagedOrgs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-sm font-bold uppercase tracking-widest text-stone-400">
                      No organizations found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="flex items-center justify-between px-6 py-4 border-t border-stone-100 bg-stone-50/60">
              <p className="text-xs font-black uppercase tracking-widest text-stone-400">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={page === 1} className="px-3 py-2 rounded-lg bg-white border border-stone-200 text-xs font-bold disabled:opacity-50">
                  Previous
                </button>
                <button onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} disabled={page === totalPages} className="px-3 py-2 rounded-lg bg-white border border-stone-200 text-xs font-bold disabled:opacity-50">
                  Next
                </button>
              </div>
            </div>
          </div>
        </section>
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl border border-stone-200 p-6">
            <h4 className="text-lg font-black mb-4">Cross-Organization Member Overview</h4>
            <div className="space-y-2">
              {(stats?.orgStats || []).map((s: any) => (
                <div key={s.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                  <span className="text-sm font-bold text-stone-800">{s.name}</span>
                  <span className="text-xs font-black uppercase text-stone-500">{s.memberCount} members</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 p-6">
            <h4 className="text-lg font-black mb-4">Payments Preview</h4>
            <div className="space-y-2 max-h-80 overflow-auto">
              {(stats?.recentPayments || []).map((p: any) => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                  <div>
                    <p className="text-sm font-bold text-stone-800">{Number(p.amount || 0).toLocaleString()} ETB</p>
                    <p className="text-xs text-stone-500">{p.method} · {new Date(p.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className="text-[10px] uppercase font-black px-2 py-1 rounded-full bg-stone-100 text-stone-700">{p.status}</span>
                </div>
              ))}
              {(!stats?.recentPayments || stats.recentPayments.length === 0) && <div className="text-sm text-stone-500">No payments yet.</div>}
            </div>
          </div>
        </section>
      </main>

      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl space-y-8"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-stone-900" />
                  </div>
                  <h3 className="text-2xl font-black tracking-tight uppercase">New Organization</h3>
                </div>
                <button onClick={() => setShowAdd(false)} className="p-2 hover:bg-stone-100 rounded-full transition-all"><X className="w-6 h-6 text-stone-400" /></button>
              </div>

              <form onSubmit={handleCreateOrg} className="space-y-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-stone-400 tracking-widest pl-2">Organization Name</label>
                  <input required className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold" placeholder="Ethiopian Tech Collective" value={newOrg.name} onChange={e => setNewOrg({...newOrg, name: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-stone-400 tracking-widest pl-2">Vanity Slug (URL)</label>
                  <div className="relative">
                    <input required className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold lowercase pl-6" placeholder="ethio-tech" value={newOrg.slug} onChange={e => setNewOrg({...newOrg, slug: e.target.value})} />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-stone-300 uppercase">.memberflow.pro</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-stone-400 tracking-widest pl-2">Description</label>
                  <textarea className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold h-24 resize-none" placeholder="Primary mission and goals..." value={newOrg.description} onChange={e => setNewOrg({...newOrg, description: e.target.value})} />
                </div>
                <div className="pt-4 flex gap-4">
                  <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-4 bg-stone-100 text-stone-600 font-bold rounded-2xl hover:bg-stone-200 transition-all">Cancel</button>
                  <button type="submit" className="flex-1 py-4 bg-stone-900 text-white font-black rounded-2xl hover:bg-stone-800 transition-all shadow-xl shadow-stone-200 uppercase tracking-widest">Create Org</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEdit && editingOrg && (
          <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl space-y-8"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black tracking-tight uppercase">Edit Organization</h3>
                <button onClick={() => setShowEdit(false)} className="p-2 hover:bg-stone-100 rounded-full transition-all"><X className="w-6 h-6 text-stone-400" /></button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-5">
                <input required className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 font-bold" value={editingOrg.name} onChange={e => setEditingOrg({ ...editingOrg, name: e.target.value })} />
                <input required className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 font-bold lowercase" value={editingOrg.slug} onChange={e => setEditingOrg({ ...editingOrg, slug: e.target.value })} />
                <textarea className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 font-bold h-24 resize-none" value={editingOrg.description || ''} onChange={e => setEditingOrg({ ...editingOrg, description: e.target.value })} />
                <select className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 font-bold" value={editingOrg.status} onChange={e => setEditingOrg({ ...editingOrg, status: e.target.value })}>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
                <div className="pt-4 flex gap-4">
                  <button type="button" onClick={() => setShowEdit(false)} className="flex-1 py-4 bg-stone-100 text-stone-600 font-bold rounded-2xl hover:bg-stone-200 transition-all">Cancel</button>
                  <button type="submit" className="flex-1 py-4 bg-stone-900 text-white font-black rounded-2xl hover:bg-stone-800 transition-all shadow-xl shadow-stone-200 uppercase tracking-widest">Save Org</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, highlight }: any) {
  const configs: any = {
    stone: 'bg-stone-50 text-stone-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  };
  return (
    <div className={`p-6 rounded-3xl border ${highlight ? 'border-2 border-stone-900 bg-white' : 'border-stone-200 bg-white'} shadow-sm space-y-4 hover:shadow-md transition-all`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${configs[color] || configs.stone}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase text-stone-400 tracking-widest">{label}</p>
        <p className="text-3xl font-black tracking-tight">{value || '0'}</p>
      </div>
    </div>
  );
}


