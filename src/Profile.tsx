import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { User, Save, Loader2, CheckCircle, AlertCircle, Lock, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import api from './services';

export default function Profile() {
  const { member, user } = useAuth();
  const [config, setConfig] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const configRes = await api.get('/config');
        setConfig(configRes.data);

        if (member) {
          setFormData({
            fullName: member.fullName,
            phoneNumber: member.phoneNumber,
            ...(member.customAttributes || {}),
          });
          setProfilePhotoUrl(member.profilePhotoUrl || '');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [member]);

  const handleSave = async () => {
    if (!user || !member) return;
    setSaving(true);
    setSuccess(false);
    
    try {
      const { fullName, phoneNumber, ...customAttributes } = formData;
      await api.patch(`/account/profile`, {
        fullName,
        phoneNumber,
        customAttributes,
      });

      await api.post('/account/profile-photo', { profilePhotoUrl });
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      alert('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      alert('Current and new password are required');
      return;
    }

    setPasswordSaving(true);
    try {
      await api.post('/account/change-password', passwordData);
      setPasswordData({ currentPassword: '', newPassword: '' });
      alert('Password changed successfully');
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to change password');
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-stone-300 font-bold uppercase tracking-widest text-xs animate-pulse">Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 text-stone-900">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center border border-stone-200">
            {profilePhotoUrl ? <img src={profilePhotoUrl} alt="Profile" className="w-full h-full rounded-2xl object-cover" /> : <User className="w-8 h-8 text-stone-600" />}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
            <p className="text-stone-400 text-sm">Profile, custom attributes, and account security.</p>
          </div>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-xl font-bold">
          {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />} Save Changes
        </button>
      </div>

      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl flex items-center gap-2 font-medium">
            <CheckCircle className="w-5 h-5" /> Profile successfully updated.
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-8">
        <section className="bg-white border border-stone-200 rounded-2xl p-6">
          <h2 className="text-sm uppercase tracking-widest font-black text-stone-400 mb-4">Personal Core</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input value={formData.fullName || ''} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl" placeholder="Full Name" />
            <input value={member?.email || ''} disabled className="w-full p-3 bg-stone-50 border border-stone-100 rounded-xl text-stone-400" />
            <input value={formData.phoneNumber || ''} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl" placeholder="Phone" />
            <div className="relative">
              <Camera className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input value={profilePhotoUrl} onChange={(e) => setProfilePhotoUrl(e.target.value)} className="w-full pl-10 p-3 bg-stone-50 border border-stone-200 rounded-xl" placeholder="Profile photo URL" />
            </div>
          </div>
        </section>

        <section className="bg-white border border-stone-200 rounded-2xl p-6">
          <h2 className="text-sm uppercase tracking-widest font-black text-stone-400 mb-4">Organization Context</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {config?.customAttributeDefinitions?.length ? (
              config.customAttributeDefinitions.map((attr: any) => (
                <div key={attr.name}>
                  <label className="block text-xs font-bold text-stone-500 mb-1">{attr.label}</label>
                  {attr.type === 'select' ? (
                    <select value={formData[attr.name] || ''} onChange={(e) => setFormData({ ...formData, [attr.name]: e.target.value })} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl">
                      <option value="">Select</option>
                      {attr.options?.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <input type={attr.type || 'text'} value={formData[attr.name] || ''} onChange={(e) => setFormData({ ...formData, [attr.name]: e.target.value })} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl" />
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-stone-50 rounded-xl border border-dashed border-stone-200 text-stone-400 md:col-span-2">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No extra fields defined.
              </div>
            )}
          </div>
        </section>

        <section className="bg-white border border-stone-200 rounded-2xl p-6">
          <h2 className="text-sm uppercase tracking-widest font-black text-stone-400 mb-4"><Lock className="w-4 h-4 inline mr-1" /> Security</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl" placeholder="Current password" />
            <input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl" placeholder="New password" />
          </div>
          <button onClick={handleChangePassword} disabled={passwordSaving} className="mt-4 px-4 py-2 rounded-xl bg-stone-900 text-white text-sm font-bold">
            {passwordSaving ? <Loader2 className="w-4 h-4 inline mr-1 animate-spin" /> : null}
            Change Password
          </button>
        </section>
      </div>
    </div>
  );
}
