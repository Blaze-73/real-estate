import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import settingService from '../../services/settingService';

const FIELD_MAP = [
  ['company_name', 'companyName', 'Company Name', 'text'],
  ['company_email', 'companyEmail', 'Company Email', 'email'],
  ['company_phone', 'companyPhone', 'Company Phone', 'tel'],
  ['company_address', 'companyAddress', 'Company Address', 'text'],
  ['whatsapp_number', 'whatsappNumber', 'WhatsApp Number (with country code)', 'text'],
  ['social_facebook', 'facebook', 'Facebook URL', 'url'],
  ['social_instagram', 'instagram', 'Instagram URL', 'url'],
  ['social_whatsapp', 'whatsapp', 'WhatsApp Profile URL', 'url'],
  ['about_us', 'about', 'About text', 'textarea'],
  ['mission', 'mission', 'Mission', 'textarea'],
  ['vision', 'vision', 'Vision', 'textarea'],
  ['commission_sale_rate', 'commissionSaleRate', 'Sale commission rate (%)', 'number'],
  ['commission_rent_rate', 'commissionRentRate', 'Rental commission rate (%)', 'number'],
];

const DEFAULT_FORM = {
  companyName: '', companyEmail: '', companyPhone: '', companyAddress: '',
  whatsappNumber: '', facebook: '', instagram: '', whatsapp: '',
  about: '', mission: '', vision: '',
  commissionSaleRate: '2.5', commissionRentRate: '10',
};

const SettingsPage = () => {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    settingService.getAll()
      .then((settings) => {
        const next = { ...DEFAULT_FORM };
        FIELD_MAP.forEach(([key, field]) => {
          if (settings[key] !== undefined && settings[key] !== null) next[field] = settings[key];
        });
        setForm(next);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await settingService.update({
        settings: FIELD_MAP.map(([key, field]) => ({ key, value: String(form[field] ?? '') })),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save settings');
    }
  };

  const inputCls = 'w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#9aa0a6]';

  const renderField = ([key, field, label, type]) => {
    if (type === 'textarea') {
      return (
        <div key={key}>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</label>
          <textarea name={field} value={form[field] ?? ''} onChange={handleChange} rows={3} className={`${inputCls} mt-1 resize-none`} />
        </div>
      );
    }
    return (
      <div key={key}>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</label>
        <input type={type === 'number' ? 'number' : type} step={type === 'number' ? '0.5' : undefined} name={field} value={form[field] ?? ''} onChange={handleChange} className={`${inputCls} mt-1`} />
      </div>
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Manage platform settings</p>
      </div>

      {error && <div className="p-4 mb-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-600 text-sm">{error}</div>}

      {loading ? (
        <p className="text-gray-400 text-sm">Loading settings...</p>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-ink-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Company Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {renderField(FIELD_MAP[0])}
              {renderField(FIELD_MAP[1])}
              {renderField(FIELD_MAP[2])}
              {renderField(FIELD_MAP[3])}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-ink-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Social Media & WhatsApp</h3>
            <div className="space-y-3">
              {renderField(FIELD_MAP[4])}
              {renderField(FIELD_MAP[5])}
              {renderField(FIELD_MAP[6])}
              {renderField(FIELD_MAP[7])}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white dark:bg-ink-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Commission Rates</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Default commission applied when a deal is closed on a sale or rental.</p>
            <div className="grid grid-cols-2 gap-3">
              {renderField(FIELD_MAP[11])}
              {renderField(FIELD_MAP[12])}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-ink-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">About Content</h3>
            <div className="space-y-3">
              {renderField(FIELD_MAP[8])}
              {renderField(FIELD_MAP[9])}
              {renderField(FIELD_MAP[10])}
            </div>
          </motion.div>

          <button type="submit" className="px-6 py-2.5 rounded-xl bg-[#ececf0] text-ink-950 text-sm font-semibold hover:bg-white transition-colors">
            {saved ? 'Saved!' : 'Save Settings'}
          </button>
        </form>
      )}
    </div>
  );
};

export default SettingsPage;
