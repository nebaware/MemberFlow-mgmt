import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db, handleFirestoreError, OperationType } from './firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { OrganizationConfig, Member } from './types';
import { User, Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function Profile() {
  const { member, user } = useAuth();
  const [config, setConfig] = useState<OrganizationConfig | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const configSnap = await getDoc(doc(db, 'config', 'org'));
        if (configSnap.exists()) {
          setConfig(configSnap.data() as OrganizationConfig);
        }
        
        if (member) {
          setFormData({
            fullName: member.fullName,
            phoneNumber: member.phoneNumber,
            ...(member.customAttributes || {})
          });
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
    
    const { fullName, phoneNumber, ...customAttributes } = formData;
    const path = `members/${user.uid}`;
    
    try {
      await updateDoc(doc(db, 'members', user.uid), {
        fullName,
        phoneNumber,
        customAttributes
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-emerald-600" /></div>;

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center border border-stone-200">
            <User className="w-6 h-6 text-stone-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-stone-900 tracking-tight">My Profile</h1>
            <p className="text-stone-400 text-sm">Manage your personal information and custom attributes</p>
          </div>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold transition-all shadow-lg shadow-stone-200"
        >
          {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />} Save Changes
        </button>
      </div>

      {success && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl flex items-center gap-2"
        >
          <CheckCircle className="w-5 h-5" /> Profile updated successfully!
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Basic Info */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-stone-900 border-b border-stone-100 pb-2">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Full Name</label>
              <input 
                value={formData.fullName || ''}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full p-3 bg-white border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Email Address</label>
              <input 
                value={member?.email || ''}
                disabled
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-400 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Phone Number</label>
              <input 
                value={formData.phoneNumber || ''}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full p-3 bg-white border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </section>

        {/* Custom Attributes */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-stone-900 border-b border-stone-100 pb-2">Organization Details</h2>
          <div className="space-y-4">
            {config?.customAttributeDefinitions.length === 0 ? (
              <div className="p-8 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-200 text-stone-400">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No custom organization fields defined.</p>
              </div>
            ) : (
              config?.customAttributeDefinitions.map((attr) => (
                <div key={attr.name}>
                  <label className="block text-xs font-bold text-stone-400 uppercase mb-1">{attr.label}</label>
                  {attr.type === 'select' ? (
                    <select 
                      value={formData[attr.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [attr.name]: e.target.value })}
                      className="w-full p-3 bg-white border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Select an option</option>
                      {attr.options?.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input 
                      type={attr.type}
                      value={formData[attr.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [attr.name]: e.target.value })}
                      className="w-full p-3 bg-white border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
