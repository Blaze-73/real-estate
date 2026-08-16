import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import rentalService from '../../services/rentalService';
import clientService from '../../services/clientService';
import propertyService from '../../services/propertyService';

const unwrap = (res) => (Array.isArray(res) ? res : res?.data ?? []);

const statusLabel = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : 'â€”');

const RentalsManagement = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [properties, setProperties] = useState([]);
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({ property_id: '', client_id: '', start_date: '', end_date: '', monthly_rent: '', deposit: '', status: 'active', notes: '' });

  const tabs = [
    { key: 'active', label: 'Active' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'expired', label: 'Expired' },
  ];

  const loadTab = (tab) => {
    setLoading(true);
    setError('');
    const call = tab === 'active' ? rentalService.getActive : tab === 'upcoming' ? rentalService.getUpcoming : rentalService.getExpired;
    call()
      .then((data) => setRentals(unwrap(data)))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load rentals'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    async function initial() {
      try {
        const call = activeTab === 'active' ? rentalService.getActive : activeTab === 'upcoming' ? rentalService.getUpcoming : rentalService.getExpired;
        const data = await call();
        setRentals(unwrap(data));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load rentals');
      } finally {
        setLoading(false);
      }
    }
    initial();
  }, [activeTab]);

  const openModal = async () => {
    setError('');
    try {
      const [props, clis] = await Promise.all([propertyService.getAll({ per_page: 200 }), clientService.getAll()]);
      setProperties(unwrap(props));
      setClients(unwrap(clis));
      setForm({ property_id: '', client_id: '', start_date: '', end_date: '', monthly_rent: '', deposit: '', status: 'active', notes: '' });
      setModalOpen(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load options');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await rentalService.create({
        ...form,
        monthly_rent: Number(form.monthly_rent),
        deposit: form.deposit === '' ? null : Number(form.deposit),
      });
      setModalOpen(false);
      loadTab(activeTab);
    } catch (err) {
      const msg = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(', ')
        : err.response?.data?.message || 'Failed to create rental';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (rental) => {
    if (!window.confirm('Delete this rental contract?')) return;
    setError('');
    try {
      await rentalService.remove(rental.id);
      setRentals((prev) => prev.filter((r) => r.id !== rental.id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete rental');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rentals</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Long-term rental contracts</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={openModal} className="px-4 py-2 rounded-xl bg-[#1f94af] text-white text-sm font-semibold hover:bg-[#117490] transition-colors">+ New Rental</motion.button>
      </div>

      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-[#1f94af] text-white'
                : 'bg-white dark:bg-ink-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 mb-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-ink-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading rentalsâ€¦</div>
        ) : rentals.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No {activeTab} rentals</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Create a rental contract to track it here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-gray-400 border-b border-gray-100 dark:border-gray-800">
                  <th className="px-4 py-3">Property</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Period</th>
                  <th className="px-4 py-3">Monthly rent</th>
                  <th className="px-4 py-3">Deposit</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {rentals.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{r.property?.title || `Property #${r.property_id}`}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{r.client?.name || `Client #${r.client_id}`}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{r.start_date} â†’ {r.end_date}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{Number(r.monthly_rent).toLocaleString()} MAD</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{r.deposit ? `${Number(r.deposit).toLocaleString()} MAD` : 'â€”'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${r.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : r.status === 'upcoming' ? 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400' : 'bg-gray-100 dark:bg-ink-900 text-gray-500 dark:text-gray-400'}`}>
                        {statusLabel(r.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => remove(r)} className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg px-2 py-1 transition-colors" aria-label="Delete rental">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setModalOpen(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-ink-900 rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">New Rental</h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">Property *</label>
                  <select value={form.property_id} onChange={(e) => setForm({ ...form, property_id: e.target.value })} required className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#1f94af]">
                    <option value="">Select property</option>
                    {properties.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">Client *</label>
                  <select value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} required className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#1f94af]">
                    <option value="">Select client</option>
                    {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Start date *</label>
                    <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} required className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#1f94af]" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">End date *</label>
                    <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} required className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#1f94af]" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Monthly rent (MAD) *</label>
                    <input type="number" min="0" value={form.monthly_rent} onChange={(e) => setForm({ ...form, monthly_rent: e.target.value })} required className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#1f94af]" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Deposit (MAD)</label>
                    <input type="number" min="0" value={form.deposit} onChange={(e) => setForm({ ...form, deposit: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#1f94af]" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#1f94af]">
                    <option value="active">Active</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
                <textarea name="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes (optional)" rows={2} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#1f94af] resize-none" />
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-[#1f94af] text-white text-sm font-semibold hover:bg-[#117490] transition-colors disabled:opacity-50">
                    {saving ? 'Savingâ€¦' : 'Create rental'}
                  </button>
                  <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RentalsManagement;
