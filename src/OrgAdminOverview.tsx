import React, { useEffect, useState } from 'react';
import { Bell, Calendar, CreditCard, MessageSquare, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from './services';

export default function OrgAdminOverview() {
  const [summary, setSummary] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [summaryRes, alertsRes, activityRes] = await Promise.all([
          api.get('/org-admin/dashboard/summary'),
          api.get('/org-admin/dashboard/alerts'),
          api.get('/org-admin/dashboard/activity'),
        ]);
        setSummary(summaryRes.data);
        setAlerts(alertsRes.data || []);
        setActivity(activityRes.data || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <div className="p-10 text-center text-stone-400 font-black uppercase tracking-widest animate-pulse">Loading overview...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Metric icon={Users} label="Members" value={summary?.memberCounts?.total ?? 0} hint={`${summary?.memberCounts?.pending ?? 0} pending`} />
        <Metric icon={Calendar} label="Events" value={summary?.eventsCounts?.total ?? 0} hint={`${summary?.eventsCounts?.published ?? 0} published`} />
        <Metric icon={MessageSquare} label="Posts" value={summary?.postCounts?.total ?? 0} hint={`${summary?.postCounts?.draft ?? 0} drafts`} />
        <Metric icon={CreditCard} label="Revenue" value={`${Number(summary?.payments?.revenue ?? 0).toLocaleString()} ETB`} hint={`${summary?.payments?.pending ?? 0} pending`} />
      </div>

      <div className="bg-white border border-stone-200 rounded-3xl p-6">
        <h3 className="text-lg font-black tracking-tight mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <QuickLink to="/dashboard/members" label="Members" />
          <QuickLink to="/dashboard/events" label="Events" />
          <QuickLink to="/dashboard/blogs" label="Announcements" />
          <QuickLink to="/dashboard/finance" label="Payments" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-stone-200 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-stone-400" />
            <h3 className="text-lg font-black tracking-tight">Alerts</h3>
          </div>
          <div className="space-y-3">
            {alerts.map((a, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <p className="text-sm font-bold text-stone-800">{a.message}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mt-1">{a.type}</p>
              </div>
            ))}
            {alerts.length === 0 && <div className="text-sm text-stone-500">No alerts.</div>}
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-3xl p-6">
          <h3 className="text-lg font-black tracking-tight mb-4">Recent Activity</h3>
          <div className="space-y-3 max-h-96 overflow-auto">
            {activity.map((l, idx) => (
              <div key={l.id || idx} className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <p className="text-sm font-bold text-stone-800">{l.action}</p>
                <p className="text-xs text-stone-500 mt-1">{new Date(l.timestamp).toLocaleString()}</p>
              </div>
            ))}
            {activity.length === 0 && <div className="text-sm text-stone-500">No recent activity.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value, hint }: any) {
  return (
    <div className="bg-white border border-stone-200 rounded-3xl p-5">
      <div className="w-10 h-10 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-center mb-3">
        <Icon className="w-5 h-5 text-stone-600" />
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">{label}</p>
      <p className="text-2xl font-black tracking-tight">{value}</p>
      <p className="text-xs text-stone-500 mt-1">{hint}</p>
    </div>
  );
}

function QuickLink({ to, label }: any) {
  return (
    <Link to={to} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 hover:bg-stone-900 hover:text-white transition-all font-bold">
      {label}
    </Link>
  );
}
