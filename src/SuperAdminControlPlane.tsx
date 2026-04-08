import React, { useEffect, useMemo, useState } from 'react';
import { Building2, Users, CreditCard, Settings, Bell, Search, Plus, LogOut } from 'lucide-react';
import api from './services';
import { useAuth } from './AuthContext';

type SectionKey = 'orgs' | 'orgAdmins' | 'members' | 'payments' | 'system' | 'logs';

export default function SuperAdminControlPlane() {
  const { logout } = useAuth();
  const [section, setSection] = useState<SectionKey>('orgs');
  const [loading, setLoading] = useState(true);

  const [orgs, setOrgs] = useState<any[]>([]);
  const [orgAdmins, setOrgAdmins] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [systemConfig, setSystemConfig] = useState<any>({});

  const [q, setQ] = useState('');
  const [showAddOrg, setShowAddOrg] = useState(false);
  const [newOrg, setNewOrg] = useState({ name: '', slug: '', description: '' });
  const [savingSystem, setSavingSystem] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [orgsRes, orgAdminsRes, membersRes, paymentsRes, logsRes, configRes] = await Promise.all([
        api.get('/super-admin/organizations'),
        api.get('/super-admin/org-admins'),
        api.get('/super-admin/members'),
        api.get('/super-admin/payments'),
        api.get('/admin/logs'),
        api.get('/super-admin/system-config'),
      ]);
      setOrgs(orgsRes.data || []);
      setOrgAdmins(orgAdminsRes.data || []);
      setMembers(membersRes.data || []);
      setPayments(paymentsRes.data || []);
      setLogs(logsRes.data || []);
      setSystemConfig(configRes.data || {});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const match = (s: string) => s.toLowerCase().includes(term);
    if (!term) {
      return { orgs, orgAdmins, members, payments, logs };
    }
    return {
      orgs: orgs.filter((o) => match(`${o.name} ${o.slug} ${o.status}`)),
      orgAdmins: orgAdmins.filter((a) => match(`${a.fullName} ${a.email} ${a.orgName}`)),
      members: members.filter((m) => match(`${m.fullName} ${m.email} ${m.orgName} ${m.status}`)),
      payments: payments.filter((p) => match(`${p.method} ${p.status} ${p.memberEmail || ''} ${p.orgName || ''} ${p.transactionId || ''}`)),
      logs: logs.filter((l) => match(`${l.action || ''} ${l.entityType || ''} ${l.actorUid || ''}`)),
    };
  }, [q, orgs, orgAdmins, members, payments, logs]);

  const createOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/super-admin/organizations', newOrg);
      setShowAddOrg(false);
      setNewOrg({ name: '', slug: '', description: '' });
      fetchAll();
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to create organization');
    }
  };

  const suspendOrg = async (id: string) => {
    try {
      await api.post(`/super-admin/organizations/${id}/suspend`);
      fetchAll();
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to suspend organization');
    }
  };

  const saveSystemConfig = async () => {
    setSavingSystem(true);
    try {
      await api.patch('/super-admin/system-config', systemConfig);
      fetchAll();
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to save system config');
    } finally {
      setSavingSystem(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans">
      <nav className="bg-white border-b border-stone-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center">
            <Bell className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight">Super Admin Control Plane</h1>
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Organizations, owners, members, payments, config</p>
          </div>
        </div>
        <button onClick={logout} className="p-2 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-red-500 transition-all"><LogOut className="w-5 h-5" /></button>
      </nav>

      <main className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <NavButton active={section === 'orgs'} onClick={() => setSection('orgs')} icon={Building2} label="Organizations" />
            <NavButton active={section === 'orgAdmins'} onClick={() => setSection('orgAdmins')} icon={Users} label="Org Admins" />
            <NavButton active={section === 'members'} onClick={() => setSection('members')} icon={Users} label="Members" />
            <NavButton active={section === 'payments'} onClick={() => setSection('payments')} icon={CreditCard} label="Payments" />
            <NavButton active={section === 'system'} onClick={() => setSection('system')} icon={Settings} label="System Config" />
            <NavButton active={section === 'logs'} onClick={() => setSection('logs')} icon={Bell} label="Audit Logs" />
          </div>
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search current section..." className="w-full bg-white border border-stone-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-stone-400 font-bold uppercase tracking-widest animate-pulse">Loading Control Plane...</div>
        ) : (
          <>
            {section === 'orgs' && (
              <section className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-black tracking-tight">Organizations</h2>
                  <button onClick={() => setShowAddOrg(true)} className="px-4 py-2 bg-stone-900 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-stone-800 transition-all shadow-lg active:scale-95">
                    <Plus className="w-4 h-4" /> Add Organization
                  </button>
                </div>

                <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                    <thead className="bg-stone-50 text-[10px] uppercase font-black tracking-widest text-stone-400">
                      <tr>
                        <th className="px-6 py-5">Organization</th>
                        <th className="px-6 py-5">Status</th>
                        <th className="px-6 py-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                      {filtered.orgs.map((org) => (
                        <tr key={org.id} className="hover:bg-stone-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-stone-800">{org.name}</div>
                            <div className="text-xs text-stone-400">slug: {org.slug}</div>
                          </td>
                          <td className="px-6 py-4 text-xs font-black uppercase tracking-widest text-stone-600">{org.status}</td>
                          <td className="px-6 py-4 text-right">
                            {org.status !== 'suspended' && (
                              <button onClick={() => suspendOrg(org.id)} className="px-3 py-2 rounded-xl bg-amber-50 text-amber-700 text-xs font-black uppercase tracking-widest">
                                Suspend
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {filtered.orgs.length === 0 && (
                        <tr><td colSpan={3} className="px-6 py-10 text-center text-sm font-bold uppercase tracking-widest text-stone-400">No organizations</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {section === 'orgAdmins' && <SimpleTable title="Org Admins" rows={filtered.orgAdmins} columns={[
              { key: 'fullName', label: 'Name' },
              { key: 'email', label: 'Email' },
              { key: 'orgName', label: 'Organization' },
              { key: 'status', label: 'Status' },
            ]} />}

            {section === 'members' && <SimpleTable title="Members" rows={filtered.members} columns={[
              { key: 'fullName', label: 'Name' },
              { key: 'email', label: 'Email' },
              { key: 'orgName', label: 'Organization' },
              { key: 'status', label: 'Status' },
            ]} />}

            {section === 'payments' && <SimpleTable title="Payments" rows={filtered.payments} columns={[
              { key: 'createdAt', label: 'Created' },
              { key: 'orgName', label: 'Org' },
              { key: 'memberEmail', label: 'Member' },
              { key: 'method', label: 'Method' },
              { key: 'amount', label: 'Amount' },
              { key: 'status', label: 'Status' },
            ]} />}

            {section === 'system' && (
              <section className="space-y-4">
                <h2 className="text-2xl font-black tracking-tight">System Config</h2>
                <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-stone-400 tracking-widest mb-2">System Name</label>
                    <input value={systemConfig.systemName || ''} onChange={(e) => setSystemConfig({ ...systemConfig, systemName: e.target.value })} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-bold outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-stone-400 tracking-widest mb-2">Default Theme</label>
                    <input value={systemConfig.defaultTheme || ''} onChange={(e) => setSystemConfig({ ...systemConfig, defaultTheme: e.target.value })} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-bold outline-none" />
                  </div>
                  <div className="flex justify-end">
                    <button onClick={saveSystemConfig} disabled={savingSystem} className="px-5 py-3 bg-stone-900 text-white rounded-xl font-black uppercase tracking-widest text-xs disabled:opacity-50">
                      {savingSystem ? 'Saving...' : 'Save Config'}
                    </button>
                  </div>
                </div>
              </section>
            )}

            {section === 'logs' && <SimpleTable title="Audit Logs" rows={filtered.logs} columns={[
              { key: 'timestamp', label: 'Time' },
              { key: 'action', label: 'Action' },
              { key: 'entityType', label: 'Type' },
              { key: 'entityId', label: 'Entity' },
              { key: 'actorUid', label: 'Actor' },
            ]} />}
          </>
        )}
      </main>

      {showAddOrg && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl space-y-6">
            <h3 className="text-2xl font-black tracking-tight uppercase">New Organization</h3>
            <form onSubmit={createOrg} className="space-y-4">
              <input required className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-6 py-4 font-bold" placeholder="Organization Name" value={newOrg.name} onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })} />
              <input required className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-6 py-4 font-bold lowercase" placeholder="slug" value={newOrg.slug} onChange={(e) => setNewOrg({ ...newOrg, slug: e.target.value })} />
              <textarea className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-6 py-4 font-bold h-24 resize-none" placeholder="Description" value={newOrg.description} onChange={(e) => setNewOrg({ ...newOrg, description: e.target.value })} />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddOrg(false)} className="flex-1 py-4 bg-stone-100 text-stone-600 font-bold rounded-2xl">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-stone-900 text-white font-black rounded-2xl uppercase tracking-widest">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function NavButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <button onClick={onClick} className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 ${active ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700'}`}>
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

function SimpleTable({ title, rows, columns }: any) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-black tracking-tight">{title}</h2>
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-stone-50 text-[10px] uppercase font-black tracking-widest text-stone-400">
            <tr>
              {columns.map((c: any) => (
                <th key={c.key} className="px-6 py-5">{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {rows.map((r: any, idx: number) => (
              <tr key={r.id || r.uid || idx} className="hover:bg-stone-50/50 transition-colors">
                {columns.map((c: any) => (
                  <td key={c.key} className="px-6 py-4 text-xs font-bold text-stone-700">
                    {String(r[c.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={columns.length} className="px-6 py-10 text-center text-sm font-bold uppercase tracking-widest text-stone-400">No records</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
