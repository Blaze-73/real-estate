import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import promotionService from '../../services/promotionService';
import propertyService from '../../services/propertyService';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';

const emptyForm = () => ({
  property_id: '',
  name: '',
  type: 'percent',
  value: '',
  min_nights: '',
  valid_from: '',
  valid_to: '',
  book_by: '',
  active: true,
});

const PromotionsManagement = () => {
  const [promotions, setPromotions] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const load = async () => {
    try {
      const [list, props] = await Promise.all([
        promotionService.list({ per_page: 50 }),
        propertyService.getAll({ per_page: 100, status: 'available' }),
      ]);
      setPromotions(list.data || list || []);
      setProperties(props.data || props || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load promotions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (promo) => {
    setEditing(promo);
    setForm({
      property_id: promo.property_id || '',
      name: promo.name || '',
      type: promo.type || 'percent',
      value: promo.value ?? '',
      min_nights: promo.min_nights ?? '',
      valid_from: promo.valid_from || '',
      valid_to: promo.valid_to || '',
      book_by: promo.book_by || '',
      active: promo.active,
    });
    setFormError('');
    setModalOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    const payload = {
      name: form.name,
      type: form.type,
      value: form.value,
      active: form.active,
    };
    if (form.property_id) payload.property_id = form.property_id;
    if (form.min_nights !== '') payload.min_nights = Number(form.min_nights);
    if (form.valid_from) payload.valid_from = form.valid_from;
    if (form.valid_to) payload.valid_to = form.valid_to;
    if (form.book_by) payload.book_by = form.book_by;
    try {
      if (editing) {
        await promotionService.update(editing.id, payload);
      } else {
        await promotionService.store(payload);
      }
      setModalOpen(false);
      setLoading(true);
      await load();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save promotion');
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (promo) => {
    try {
      await promotionService.destroy(promo.id);
      setDeleteConfirm(null);
      setLoading(true);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete promotion');
      setDeleteConfirm(null);
    }
  };

  const formatDiscount = (p) => {
    if (p.type === 'percent') return `${p.value}% off`;
    return `${Number(p.value).toLocaleString()} MAD off`;
  };

  const formatWindow = (p) => {
    const parts = [];
    if (p.valid_from) parts.push(`from ${p.valid_from}`);
    if (p.valid_to) parts.push(`to ${p.valid_to}`);
    if (p.book_by) parts.push(`book by ${p.book_by}`);
    if (p.min_nights) parts.push(`${p.min_nights}+ nights`);
    return parts.length ? parts.join(' Â· ') : 'Always active';
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#9aa0a6]";
  const labelCls = "block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Promotions</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Long-stay, early-bird and seasonal discounts applied automatically at checkout.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 rounded-xl bg-[#ececf0] hover:bg-white text-ink-950 text-sm font-semibold transition-colors"
        >
          + New promotion
        </button>
      </div>

      {error && (
        <p className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">{error}</p>
      )}

      <div className="bg-white dark:bg-ink-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Property</th>
                <th className="px-4 py-3">Discount</th>
                <th className="px-4 py-3">Rules</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6"><TableSkeleton rows={4} /></td></tr>
              ) : promotions.length === 0 ? (
                <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-400">No promotions yet. Create your first one.</td></tr>
              ) : (
                promotions.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 dark:border-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{p.name}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {p.property ? p.property.title : <span className="text-[#63686f] dark:text-[#d9d9de]">All properties</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-semibold">
                        {formatDiscount(p)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{formatWindow(p)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${p.active ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-ink-900 text-gray-500 dark:text-gray-400'}`}>
                        {p.active ? 'Active' : 'Paused'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button onClick={() => openEdit(p)} className="text-[#63686f] dark:text-[#d9d9de] hover:text-[#52575d] text-xs font-semibold mr-3 transition-colors">Edit</button>
                      <button onClick={() => setDeleteConfirm(p)} className="text-red-500 hover:text-red-600 text-xs font-semibold transition-colors">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.96, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 10 }}
              className="bg-white dark:bg-ink-900 rounded-2xl w-full max-w-lg p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                {editing ? 'Edit promotion' : 'New promotion'}
              </h2>
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className={labelCls}>Name</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="e.g. Moussem early-bird" required />
                </div>
                <div>
                  <label className={labelCls}>Applies to</label>
                  <select value={form.property_id} onChange={(e) => setForm({ ...form, property_id: e.target.value })} className={inputCls}>
                    <option value="">All properties</option>
                    {properties.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Type</label>
                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputCls}>
                      <option value="percent">Percent off</option>
                      <option value="fixed">Fixed amount (MAD)</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Value</label>
                    <input type="number" min="0.01" step="0.01" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className={inputCls} placeholder={form.type === 'percent' ? '15' : '500'} required />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={labelCls}>Min nights</label>
                    <input type="number" min="1" value={form.min_nights} onChange={(e) => setForm({ ...form, min_nights: e.target.value })} className={inputCls} placeholder="Any" />
                  </div>
                  <div>
                    <label className={labelCls}>Valid from</label>
                    <input type="date" value={form.valid_from} onChange={(e) => setForm({ ...form, valid_from: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Valid to</label>
                    <input type="date" value={form.valid_to} onChange={(e) => setForm({ ...form, valid_to: e.target.value })} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Book by (early-bird deadline)</label>
                  <input type="date" value={form.book_by} onChange={(e) => setForm({ ...form, book_by: e.target.value })} className={inputCls} />
                  <p className="text-[11px] text-gray-400 mt-1">Promotion stops applying once this date has passed.</p>
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="h-4 w-4 rounded accent-[#9aa0a6]" />
                  Active
                </label>
                {formError && <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>}
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Cancel</button>
                  <button type="submit" disabled={submitting} className="px-5 py-2 rounded-xl bg-[#ececf0] hover:bg-white text-ink-950 text-sm font-semibold transition-colors disabled:opacity-50">
                    {submitting ? 'Saving...' : editing ? 'Save changes' : 'Create promotion'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.96, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 10 }}
              className="bg-white dark:bg-ink-900 rounded-2xl w-full max-w-sm p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">Delete "{deleteConfirm.name}"?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">This removes the promotion. Existing bookings keep their discount.</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 rounded-xl text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Cancel</button>
                <button onClick={() => remove(deleteConfirm)} className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PromotionsManagement;
