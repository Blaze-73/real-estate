import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchPropertyReviews, submitPropertyReview } from '../../services/reviewService';

const Star = ({ filled, className = '' }) => (
  <svg
    className={`h-4 w-4 ${filled ? 'text-[#F59E0B]' : 'text-gray-300 dark:text-gray-600'} ${className}`}
    fill="currentColor"
    viewBox="0 0 20 20"
    aria-hidden="true"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const ReviewsSection = ({ property }) => {
  const slug = property?.slug;
  const ratingScore = property?.rating_score || 0;
  const reviewsCount = property?.reviews_count || 0;

  const [reviews, setReviews] = useState(property?.reviews || []);
  const [loading, setLoading] = useState(reviews.length === 0 && reviewsCount > 0);
  const [form, setForm] = useState({ guest_name: '', rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (!slug || (property?.reviews && property.reviews.length > 0)) return;
    let cancelled = false;
    fetchPropertyReviews(slug)
      .then((data) => {
        if (!cancelled) {
          setReviews(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug, property?.reviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!slug) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      await submitPropertyReview(slug, form);
      setForm({ guest_name: '', rating: 5, comment: '' });
      setFeedback({ type: 'success', text: "Thank you! Your review will appear once approved by the owner." });
    } catch (err) {
      setFeedback({ type: 'error', text: err?.response?.data?.message || 'Could not submit your review. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mb-8" aria-labelledby="reviews-heading">
      <div className="flex items-center gap-3 mb-4">
        <h2 id="reviews-heading" className="text-xl font-semibold text-gray-900 dark:text-white">Guest Reviews</h2>
        {reviewsCount > 0 && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#38BDF8]/10 text-[#38BDF8] text-sm font-semibold">
            <Star filled />
            {ratingScore.toFixed(1)}
            <span className="font-normal text-gray-500 dark:text-gray-400">({reviewsCount})</span>
          </span>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading reviews...</p>
      ) : reviews.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {reviews.map((review, idx) => (
            <motion.div
              key={review.id ?? idx}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="rounded-2xl bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 p-5"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#38BDF8]/10 text-[#38BDF8] font-bold text-sm">
                  {(review.guest_name || 'G').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">{review.guest_name}</p>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} filled={n <= review.rating} className="h-3.5 w-3.5" />
                    ))}
                  </div>
                </div>
                <span className="text-xs text-gray-400 shrink-0">
                  {new Date(review.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">"{review.comment}"</p>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400">No reviews yet. Be the first to review this property!</p>
      )}

      <div className="mt-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 p-5">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Write a Review</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Your review helps other travelers. It will be published after approval.</p>

        {feedback && (
          <p className={`mb-3 p-3 rounded-xl border text-sm ${
            feedback.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
          }`}>
            {feedback.text}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={form.guest_name}
            onChange={(e) => setForm({ ...form, guest_name: e.target.value })}
            placeholder="Your Name"
            required
            className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8]"
          />
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">Rating:</span>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                aria-label={`${n} star${n > 1 ? 's' : ''}`}
                aria-pressed={form.rating === n}
                onClick={() => setForm({ ...form, rating: n })}
                className="transition-transform hover:scale-110"
              >
                <Star filled={n <= form.rating} className="h-5 w-5" />
              </button>
            ))}
          </div>
          <textarea
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
            placeholder="Share your experience..."
            rows={3}
            required
            className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8] resize-none"
          />
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-[#38BDF8] hover:bg-[#0EA5E9] text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </section>
  );
};

export default ReviewsSection;
