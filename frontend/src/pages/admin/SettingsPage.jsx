import { useState } from 'react';
import { motion } from 'framer-motion';

const SettingsPage = () => {
  const [form, setForm] = useState({
    companyName: 'Asilah Real Estate',
    email: 'contact@asilahrealestate.com',
    phone: '+212 5XX XX XX XX',
    address: 'Asilah Medina, Asilah 90050, Morocco',
    facebook: '',
    instagram: '',
    whatsapp: '212XXXXXXXXX',
    about: 'Premium rental properties managed professionally in the beautiful coastal city of Asilah, Morocco.',
    mission: 'To provide exceptional real estate services...',
    vision: 'To become the most trusted real estate platform...',
  });
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Manage platform settings</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-[#1E293B] rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Company Information</h3>
          <div className="space-y-3">
            <input type="text" name="companyName" value={form.companyName} onChange={handleChange} placeholder="Company Name" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8]" />
            <div className="grid grid-cols-2 gap-3">
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8]" />
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8]" />
            </div>
            <input type="text" name="address" value={form.address} onChange={handleChange} placeholder="Address" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8]" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-[#1E293B] rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Social Media Links</h3>
          <div className="space-y-3">
            <input type="url" name="facebook" value={form.facebook} onChange={handleChange} placeholder="Facebook URL" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8]" />
            <input type="url" name="instagram" value={form.instagram} onChange={handleChange} placeholder="Instagram URL" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8]" />
            <input type="text" name="whatsapp" value={form.whatsapp} onChange={handleChange} placeholder="WhatsApp Number (with country code)" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8]" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-[#1E293B] rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">About Content</h3>
          <div className="space-y-3">
            <textarea name="about" value={form.about} onChange={handleChange} placeholder="About text" rows={3} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8] resize-none" />
            <textarea name="mission" value={form.mission} onChange={handleChange} placeholder="Mission" rows={3} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8] resize-none" />
            <textarea name="vision" value={form.vision} onChange={handleChange} placeholder="Vision" rows={3} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8] resize-none" />
          </div>
        </motion.div>

        <button type="submit" className="px-6 py-2.5 rounded-xl bg-[#38BDF8] text-white text-sm font-semibold hover:bg-[#0EA5E9] transition-colors">
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
};

export default SettingsPage;
