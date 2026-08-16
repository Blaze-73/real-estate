import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import testimonialService from '../../services/testimonialService';

const initials = (name) =>
  name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('') || '?';

const Stars = ({ count, className = 'h-4 w-4' }) => {
  const { t } = useTranslation();
  return (
    <div className="flex gap-0.5 text-gold-400" aria-label={t('testimonials.starsOutOf', { count })}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`${className} ${i < count ? '' : 'opacity-25'}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

const Avatar = ({ name, photo, className }) => {
  if (photo) {
    return <img src={photo} alt={name} className={`${className} object-cover`} loading="lazy" />;
  }
  return <span className={className}>{initials(name)}</span>;
};

const TestimonialCarousel = ({ onLoaded }) => {
  const { t } = useTranslation();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);
  const lengthRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    testimonialService
      .getAll()
      .then((data) => {
        if (cancelled) return;
        const items = (Array.isArray(data) ? data : []).slice(0, 8);
        setTestimonials(items);
        lengthRef.current = items.length;
        onLoaded?.(items.length);
      })
      .catch(() => {
        if (!cancelled) {
          setTestimonials([]);
          lengthRef.current = 0;
          onLoaded?.(0);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [onLoaded]);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % (lengthRef.current || 1));
    }, 6000);
    return () => clearInterval(timerRef.current);
  }, [paused]);

  if (loading || testimonials.length === 0) {
    return null;
  }

  const active = testimonials[current];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14"
    >
      {/* featured quote */}
      <div className="lg:col-span-7">
        <div className="relative rounded-3xl bg-white p-8 shadow-xl shadow-ink-950/5 ring-1 ring-ink-100 sm:p-12 dark:bg-ink-950 dark:ring-ink-800">
          <span className="pointer-events-none absolute -top-2 left-8 font-display text-[7rem] leading-none text-ocean-600/15 dark:text-ocean-300/15" aria-hidden="true">
            &ldquo;
          </span>
          <div className="relative">
            <Stars count={active.rating} />
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={current}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="mt-6 font-display text-2xl font-medium leading-snug tracking-tight text-ink-900 sm:text-[1.7rem] dark:text-sand-50"
              >
                &ldquo;{active.content}&rdquo;
              </motion.blockquote>
            </AnimatePresence>
            <div className="mt-8 flex items-center gap-4">
              <Avatar
                name={active.client_name}
                photo={active.client_photo}
                className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-ocean-600 text-sm font-bold uppercase tracking-wide text-white"
              />
              <div>
                <p className="font-display text-lg font-semibold text-ink-900 dark:text-sand-50">{active.client_name}</p>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-ink-100 pt-6 dark:border-ink-800">
              <p className="text-xs font-medium text-ink-400 dark:text-ink-300">
                {String(current + 1).padStart(2, '0')} / {String(testimonials.length).padStart(2, '0')}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                  aria-label={t('testimonials.previous')}
                  className="grid h-10 w-10 place-items-center rounded-full border border-ink-200 text-ink-700 transition-colors hover:border-ocean-500 hover:text-ocean-600 dark:border-ink-700 dark:text-sand-100 dark:hover:border-ocean-300 dark:hover:text-ocean-300"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrent((prev) => (prev + 1) % testimonials.length)}
                  aria-label={t('testimonials.next')}
                  className="grid h-10 w-10 place-items-center rounded-full border border-ink-200 text-ink-700 transition-colors hover:border-ocean-500 hover:text-ocean-600 dark:border-ink-700 dark:text-sand-100 dark:hover:border-ocean-300 dark:hover:text-ocean-300"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* secondary list */}
      <div className="lg:col-span-5">
        <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-ink-400 dark:text-ink-300">
          {t('testimonials.moreVoices')}
        </p>
        <ul className="space-y-3">
          {testimonials.map((item, idx) => {
            const isActive = idx === current;
            return (
              <li key={item.id ?? idx}>
                <button
                  type="button"
                  onClick={() => setCurrent(idx)}
                  aria-pressed={isActive}
                  className={`flex w-full items-center gap-4 rounded-2xl p-4 text-left transition-all duration-300 ${
                    isActive
                      ? 'bg-ink-950 text-sand-50 shadow-lg shadow-ink-950/15 dark:bg-white dark:text-ink-950'
                      : 'bg-white text-ink-900 ring-1 ring-ink-100 hover:ring-ocean-300 dark:bg-ink-950 dark:text-sand-50 dark:ring-ink-800 dark:hover:ring-ocean-500/60'
                  }`}
                >
                  <Avatar
                    name={item.client_name}
                    photo={item.client_photo}
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ocean-600/10 text-sm font-bold uppercase tracking-wide text-ocean-700 dark:bg-ocean-300/10 dark:text-ocean-300"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-base font-semibold">{item.client_name}</span>
                    <span className="block truncate text-xs leading-relaxed opacity-70">{item.content}</span>
                  </span>
                  <Stars count={item.rating} className="h-3 w-3" />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </motion.div>
  );
};

export default TestimonialCarousel;