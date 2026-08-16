import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchAdminReviews, approveReview, deleteReview } from '../../services/reviewService';

const Star = ({ filled }) => (
  <svg className={`w-4 h-4 ${filled ? 'text-[#F59E0B]' : 'text-gray-300 dark:text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const toList = (data) =>
  Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];

const ReviewsManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [pendingOnly, setPendingOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = (pending) => {
    setLoading(true);
    fetchAdminReviews({ pending_only: pending ? 1 : 0 })
      .then((data) => setReviews(toList(data)))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let cancelled = false;
    fetchAdminReviews({ pending_only: 0 })
      .then((data) => { if (!cancelled) setReviews(toList(data)); })
      .catch(() => { if (!cancelled) setReviews([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handleApprove = async (id) => {
    await approveReview(id);
    load(pendingOnly);
  };

  const handleDelete = async (id) => {
    await deleteReview(id);
    setConfirmDelete(null);
    load(pendingOnly);
  };

  const togglePendingFilter = () => {
    const next = !pendingOnly;
    setPendingOnly(next);
    load(next);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reviews</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Approve and moderate guest reviews</p>
        </div>
        <button
          onClick={togglePendingFilter}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
            pendingOnly
              ? 'bg-amber-500 text-white'
              : 'bg-white dark:bg-ink-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          {pendingOnly ? 'Showing pending' : 'Show pending only'}
        </button>
      </div>

      <div className="bg-white dark:bg-ink-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading...</div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center text-gray-400">{pendingOnly ? 'No pending reviews.' : 'No reviews yet.'}</div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {reviews.map((r) => (
              <div key={r.id} className="p-4 flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-[240px]">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 dark:text-white">{r.guest_name}</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} filled={i < r.rating} />
                      ))}
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${r.is_approved ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'}`}>
                      {r.is_approved ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                  {r.property?.title && (
                    <p className="text-xs text-gray-400 mb-1">on {r.property.title}</p>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">"{r.comment}"</p>
                </div>
                <div className="flex items-center gap-2">
                  {!r.is_approved && (
                    <button
                      onClick={() => handleApprove(r.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#1f94af] text-white hover:bg-[#117490] transition-colors"
                    >
                      Approve
                    </button>
                  )}
                  <button
                    onClick={() => setConfirmDelete(r.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {confirmDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setConfirmDelete(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-ink-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete this review?</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => handleDelete(confirmDelete)} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors">Delete</button>
                <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReviewsManagement;
