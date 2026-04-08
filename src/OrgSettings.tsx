import React, { useEffect, useState } from 'react';
import { Save, Loader2, Plus, Trash2, Shield } from 'lucide-react';
import api from './services';

export default function OrgSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<any>({ name: '', customAttributeDefinitions: [] });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await api.get('/config');
      setConfig({
        name: res.data.name || '',
        description: res.data.description || '',
        customAttributeDefinitions: res.data.customAttributeDefinitions || [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const addAttribute = () => {
    setConfig({
      ...config,
      customAttributeDefinitions: [...config.customAttributeDefinitions, { name: `attr_${Date.now()}`, label: 'New Field', type: 'text' }],
    });
  };

  const updateAttribute = (index: number, patch: any) => {
    const next = [...config.customAttributeDefinitions];
    next[index] = { ...next[index], ...patch };
    setConfig({ ...config, customAttributeDefinitions: next });
  };

  const removeAttribute = (index: number) => {
    setConfig({
      ...config,
      customAttributeDefinitions: config.customAttributeDefinitions.filter((_: any, i: number) => i !== index),
    });
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      await api.post('/config', config);
      alert('Organization settings saved');
    } catch {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    try {
      await api.post('/auth/change-password', passwordData);
      setPasswordData({ currentPassword: '', newPassword: '' });
      alert('Password changed successfully');
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to change password');
    }
  };

  if (loading) return <div className="text-stone-400">Loading organization settings...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-stone-200 rounded-2xl p-6">
        <h3 className="text-xl font-black mb-4">Organization Profile</h3>
        <div className="space-y-3">
          <input value={config.name || ''} onChange={(e) => setConfig({ ...config, name: e.target.value })} className="w-full border border-stone-200 rounded-xl p-3" placeholder="Organization name" />
          <textarea value={config.description || ''} onChange={(e) => setConfig({ ...config, description: e.target.value })} className="w-full border border-stone-200 rounded-xl p-3 h-24" placeholder="Description" />
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-black">Custom Member Attributes</h3>
          <button onClick={addAttribute} className="px-3 py-2 rounded-xl bg-stone-100 text-stone-700 text-sm font-bold"><Plus className="w-4 h-4 inline mr-1" /> Add</button>
        </div>

        <div className="space-y-3">
          {config.customAttributeDefinitions.map((attr: any, index: number) => (
            <div key={attr.name} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100">
              <input value={attr.label} onChange={(e) => updateAttribute(index, { label: e.target.value })} className="border border-stone-200 rounded-lg p-2" placeholder="Label" />
              <input value={attr.name} onChange={(e) => updateAttribute(index, { name: e.target.value })} className="border border-stone-200 rounded-lg p-2" placeholder="Key" />
              <div className="flex gap-2">
                <select value={attr.type} onChange={(e) => updateAttribute(index, { type: e.target.value })} className="flex-1 border border-stone-200 rounded-lg p-2">
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="select">Select</option>
                </select>
                <button onClick={() => removeAttribute(index)} className="px-3 py-2 rounded-lg bg-red-50 text-red-700"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl p-6">
        <h3 className="text-xl font-black mb-4"><Shield className="w-4 h-4 inline mr-1" /> Security</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} className="border border-stone-200 rounded-xl p-3" placeholder="Current password" />
          <input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} className="border border-stone-200 rounded-xl p-3" placeholder="New password" />
        </div>
        <button onClick={changePassword} className="mt-4 px-4 py-2 rounded-xl bg-stone-900 text-white text-sm font-bold">Change Password</button>
      </div>

      <div className="flex justify-end">
        <button onClick={saveConfig} disabled={saving} className="px-4 py-2 rounded-xl bg-stone-900 text-white font-bold">
          {saving ? <Loader2 className="w-4 h-4 inline mr-1 animate-spin" /> : <Save className="w-4 h-4 inline mr-1" />} Save Settings
        </button>
      </div>
    </div>
  );
}
