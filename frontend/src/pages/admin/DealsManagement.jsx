import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dealService from '../../services/dealService';
import propertyService from '../../services/propertyService';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';

const STATUS_BADGE = {
  contacted: 'bg-gray-100 dark:bg-ink-900 text-gray-600 dark:text-gray-400',
  viewing: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  offer: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  negotiated: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400',
  closed: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  lost: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
};

const STATUSES = ['contacted', 'viewing', 'offer', 'negotiated', 'closed', 'lost'];
const TYPES = ['sale', 'rent', 'seasonal'];

const emptyForm = () => ({
  property_id: '', type: 'rent', status: 'contacted',
  client_name: '', client_email: '', client_phone: '',
  price: '', commission_rate: '', notes: '',
});

const DealsManagement = () => {
  const [deals, setDeals] = useState([]);
  const [stats, setStats] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const load = async () => {
    try {
      const [list, statsData, props] = await Promise.all([
        dealService.list({ status: statusFilter || undefined, per_page: 50 }),
        dealService.stats(),
        propertyService.getAll({ per_page: 100, status: 'available' }),
      ]);
      setDeals(list.data || list || []);
      setStats(statsData);
      setProperties(props.data || props || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load deals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (deal) => {
    setEditing(deal);
    setForm({
      property_id: deal.property_id || deal.property?.id || '',
      type: deal.type || 'rent',
      status: deal.status || 'contacted',
      client_name: deal.client_name || '',
      client_email: deal.client_email || '',
      client_phone: deal.client_phone || '',
      price: deal.price ?? '',
      commission_rate: deal.commission_rate ?? '',
      notes: deal.notes || '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleTypeChange = (type) => {
    const fallback = type === 'sale' ? stats?.default_sale_rate ?? '2.5' : stats?.default_rent_rate ?? '10';
    setForm({ ...form, type, commission_rate: form.commission_rate || fallback });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    const payload = {
      property_id: Number(form.property_id),
      type: form.type,
      status: form.status,
      client_name: form.client_name || null,
      client_email: form.client_email || null,
      client_phone: form.client_phone || null,
      price: form.price === '' ? null : Number(form.price),
      commission_rate: form.commission_rate === '' ? null : Number(form.commission_rate),
      notes: form.notes || null,
    };
    try {
      if (editing) {
        await dealService.update(editing.id, payload);
      } else {
        await dealService.store(payload);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setFormError(err.response?.data?.message || err.response?.data?.errors || 'Failed to save deal');
    } finally {
      setSubmitting(false);
    }
  };

  const quickClose = async (deal) => {
    try {
      await dealService.update(deal.id, { status: 'closed' });
      load();
    } catch {
      setError('Failed to close deal');
    }
  };

  const handleDelete = async () => {
    try {
      await dealService.destroy(deleteConfirm);
      setDeleteConfirm(null);
      load();
    } catch {
      setError('Failed to delete deal');
    }
  };

  const statCards = [
    { label: 'Total Commission (Closed)', value: stats ? `${Number(stats.total_commission || 0).toLocaleString()} MAD` : 'â€”', accent: 'text-green-600 dark:text-green-400' },
    { label: 'Active Deals', value: stats?.active_deals ?? 'â€”' },
    { label: 'Closed Deals', value: stats?.closed_deals ?? 'â€”' },
    { label: 'Total Deals', value: stats?.total_deals ?? 'â€”' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Deals & Commission</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Track deals and commission even when payment happens outside the platform</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={openCreate} className="px-4 py-2 rounded-xl bg-[#ececf0] text-ink-950 text-sm font-semibold hover:bg-white transition-colors">
          + New Deal
        </motion.button>
      </div>

      {error && <div className="p-4 mb-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-600 text-sm">{error}</div>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white dark:bg-ink-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{card.label}</p>
            <p className={`mt-1 text-xl font-bold ${card.accent || 'text-gray-900 dark:text-white'}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mr-1">Status:</span>
        {[{ value: '', label: 'All' }, ...STATUSES.map((s) => ({ value: s, label: s }))].map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors capitalize ${
              statusFilter === opt.value
                ? 'bg-[#ececf0] text-ink-950 border-[#9aa0a6]'
                : 'bg-white dark:bg-ink-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-ink-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="p-6"><TableSkeleton rows={6} /></div>
        ) : deals.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No deals found. Create one to start tracking commission.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-ink-900/50">
                  <th className="text-left p-4 font-medium text-gray-500 dark:text-gray-400">Property</th>
                  <th className="text-left p-4 font-medium text-gray-500 dark:text-gray-400">Client</th>
                  <th className="text-left p-4 font-medium text-gray-500 dark:text-gray-400">Type</th>
                  <th className="text-left p-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="text-left p-4 font-medium text-gray-500 dark:text-gray-400">Price</th>
                  <th className="text-left p-4 font-medium text-gray-500 dark:text-gray-400">Commission</th>
                  <th className="text-right p-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {deals.map((deal) => (
                  <tr key={deal.id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="p-4 text-gray-900 dark:text-white font-medium">{deal.property?.title || 'â€”'}</td>
                    <td className="p-4 text-gray-500 dark:text-gray-400">
                      {deal.client_name || deal.contact?.name || 'â€”'}
                      {deal.client_email && <span className="block text-xs">{deal.client_email}</span>}
                    </td>
                    <td className="p-4 text-gray-500 dark:text-gray-400 capitalize">{deal.type}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${STATUS_BADGE[deal.status] || STATUS_BADGE.contacted}`}>{deal.status}</span>
                    </td>
                    <td className="p-4 text-gray-900 dark:text-white">{deal.price ? `${Number(deal.price).toLocaleString()} MAD` : 'â€”'}</td>
                    <td className="p-4">
                      <span className="text-gray-900 dark:text-white">{deal.commission_amount ? `${Number(deal.commission_amount).toLocaleString()} MAD` : 'â€”'}</span>
                      {deal.commission_rate && <span className="block text-xs text-gray-400">{deal.commission_rate}%</span>}
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      {deal.status !== 'closed' && deal.status !== 'lost' && (
                        <button onClick={() => quickClose(deal)} className="px-3 py-1.5 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors text-xs font-medium mr-2">Close</button>
                      )}
                      <button onClick={() => openEdit(deal)} className="px-3 py-1.5 rounded-lg text-[#63686f] dark:text-[#d9d9de] hover:bg-[#ececf0]/10 transition-colors text-xs font-medium mr-2">Edit</button>
                      <button onClick={() => setDeleteConfirm(deal.id)} className="px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-xs font-medium">Delete</button>
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
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-ink-900 rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{editing ? 'Edit Deal' : 'New Deal'}</h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Property</label>
                  <select name="property_id" value={form.property_id} onChange={handleChange} className="w-full mt-1 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#9aa0a6]" required>
                    <option value="">Select property</option>
                    {properties.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</label>
                    <select name="type" value={form.type} onChange={(e) => handleTypeChange(e.target.value)} className="w-full mt-1 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#9aa0a6]">
                      {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</label>
                    <select name="status" value={form.status} onChange={handleChange} className="w-full mt-1 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#9aa0a6]">
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Client Name</label>
                    <input type="text" name="client_name" value={form.client_name} onChange={handleChange} className="w-full mt-1 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#9aa0a6]" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Client Email</label>
                    <input type="email" name="client_email" value={form.client_email} onChange={handleChange} className="w-full mt-1 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#9aa0a6]" />
                  </div>
                </div>
                <input type="tel" name="client_phone" value={form.client_phone} onChange={handleChange} placeholder="Client phone" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#9aa0a6]" />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Final Price (MAD)</label>
                    <input type="number" name="price" value={form.price} onChange={handleChange} className="w-full mt-1 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#9aa0a6]" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Commission %</label>
                    <input type="number" name="commission_rate" value={form.commission_rate} onChange={handleChange} step="0.1" className="w-full mt-1 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#9aa0a6]" />
                  </div>
                </div>
                <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Notes" rows={2} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#9aa0a6] resize-none" />
                {formError && <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-600 text-sm">{typeof formError === 'string' ? formError : JSON.stringify(formError)}</div>}
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-[#ececf0] text-ink-950 text-sm font-semibold hover:bg-white transition-colors disabled:opacity-60">{submitting ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
                  <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white dark:bg-ink-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Deal?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors">Delete</button>
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DealsManagement;
