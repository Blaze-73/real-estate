import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import testimonialService from '../../services/testimonialService';

const RatingStars = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <svg key={n} className={`w-4 h-4 ${n <= rating ? 'text-[#F59E0B]' : 'text-gray-300 dark:text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

const emptyForm = { client_name: '', content: '', rating: 5, is_active: true, photo: null };

const TestimonialsManagement = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    testimonialService
      .listAdmin({ per_page: 100 })
      .then((data) => setTestimonials(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load testimonials'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    async function initial() {
      try {
        const data = await testimonialService.listAdmin({ per_page: 100 });
        setTestimonials(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load testimonials');
      } finally {
        setLoading(false);
      }
    }
    initial();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = new FormData();
      payload.append('client_name', form.client_name);
      payload.append('content', form.content);
      payload.append('rating', form.rating);
      payload.append('is_active', form.is_active ? '1' : '0');
      if (form.photo) payload.append('client_photo', form.photo);
      await testimonialService.create(payload);
      setModalOpen(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add testimonial');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (item) => {
    setBusyId(item.id);
    setError('');
    try {
      await testimonialService.update(item.id, { is_active: !item.is_active });
      setTestimonials((prev) => prev.map((x) => (x.id === item.id ? { ...x, is_active: !x.is_active } : x)));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update testimonial');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (item) => {
    if (!window.confirm(`Delete testimonial from ${item.client_name}?`)) return;
    setBusyId(item.id);
    setError('');
    try {
      await testimonialService.remove(item.id);
      setTestimonials((prev) => prev.filter((x) => x.id !== item.id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete testimonial');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Testimonials</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Manage client testimonials. Only verified, real clients should be published.</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setError(''); setForm(emptyForm); setModalOpen(true); }} className="px-4 py-2 rounded-xl bg-[#ececf0] text-ink-950 text-sm font-semibold hover:bg-white transition-colors">+ Add Testimonial</motion.button>
      </div>

      {error && (
        <div className="p-4 mb-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-ink-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading testimonials…</div>
        ) : testimonials.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No testimonials yet. Add your first verified client testimonial.</div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {testimonials.map((t) => (
              <div key={t.id} className="p-4 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    {t.client_photo && (
                      <img src={t.client_photo} alt={t.client_name} className="w-9 h-9 rounded-full object-cover" loading="lazy" />
                    )}
                    <span className="font-semibold text-gray-900 dark:text-white">{t.client_name}</span>
                    <RatingStars rating={t.rating} />
                    <span className={`text-xs px-2 py-0.5 rounded-full ${t.is_active ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-ink-900 text-gray-500 dark:text-gray-400'}`}>
                      {t.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">"{t.content}"</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(t.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => toggleActive(t)} disabled={busyId === t.id} className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${t.is_active ? 'bg-gray-100 dark:bg-ink-900 text-gray-600 dark:text-gray-300' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'}`}>
                    {t.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button onClick={() => remove(t)} disabled={busyId === t.id} className="px-3 py-1 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setModalOpen(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-ink-900 rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add Testimonial</h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input type="text" name="client_name" value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} placeholder="Client name" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#9aa0a6]" required />
                <textarea name="content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="What they said, in their words" rows={3} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#9aa0a6] resize-none" required />
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">Rating</label>
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} type="button" onClick={() => setForm({ ...form, rating: n })} aria-label={`${n} stars`}>
                        <svg className={`w-6 h-6 ${n <= form.rating ? 'text-[#F59E0B]' : 'text-gray-300 dark:text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
                <label className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-200">
                  <span>Publish now</span>
                  <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-5 h-5 accent-[#9aa0a6]" />
                </label>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">Client photo (optional)</label>
                  <input type="file" accept="image/jpeg,image/png" onChange={(e) => setForm({ ...form, photo: e.target.files?.[0] || null })} className="mt-1 w-full text-sm text-gray-500 dark:text-gray-400" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-[#ececf0] text-ink-950 text-sm font-semibold hover:bg-white transition-colors disabled:opacity-50">
                    {saving ? 'Saving…' : 'Add'}
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

export default TestimonialsManagement;
