import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const fieldClass =
  'w-full rounded-xl border border-ink-100 bg-sand-50 px-3.5 py-3 text-sm text-ink-900 placeholder-ink-400 outline-none transition-colors focus:border-ocean-500 focus:ring-2 focus:ring-ocean-500/25 dark:border-ink-700 dark:bg-ink-800 dark:text-sand-50 dark:placeholder-ink-300';

const labelClass =
  'mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-400 dark:text-ink-300';

const SearchBar = ({ onSearch, className = '' }) => {
  const { t } = useTranslation();
  const [flexible, setFlexible] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const filters = {
      type: data.get('type') || '',
      min_price: data.get('min_price') || '',
      max_price: data.get('max_price') || '',
      bedrooms: data.get('bedrooms') || '',
      bathrooms: data.get('bathrooms') || '',
    };
    if (!flexible) {
      filters.check_in = data.get('check_in') || '';
      filters.check_out = data.get('check_out') || '';
    }
    if (onSearch) onSearch(filters);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      onSubmit={handleSubmit}
      className={className}
      noValidate
    >
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-5 lg:gap-3">
        <select name="type" defaultValue="" aria-label={t('search.propertyType')} className={fieldClass}>
          <option value="" disabled>{t('search.propertyType')}</option>
          <option value="apartment">{t('types.apartment')}</option>
          <option value="villa">{t('types.villa')}</option>
          <option value="house">{t('types.house')}</option>
          <option value="studio">{t('types.studio')}</option>
          <option value="office">{t('types.office')}</option>
        </select>
        <input
          type="number"
          name="min_price"
          min="0"
          placeholder={t('search.minPrice')}
          aria-label={t('search.minPrice')}
          className={fieldClass}
        />
        <input
          type="number"
          name="max_price"
          min="0"
          placeholder={t('search.maxPrice')}
          aria-label={t('search.maxPrice')}
          className={fieldClass}
        />
        <select name="bedrooms" defaultValue="" aria-label={t('search.bedrooms')} className={fieldClass}>
          <option value="" disabled>{t('search.bedrooms')}</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>{t('search.beds', { count: n })}</option>
          ))}
        </select>
        <select name="bathrooms" defaultValue="" aria-label={t('search.bathrooms')} className={fieldClass}>
          <option value="" disabled>{t('search.bathrooms')}</option>
          {[1, 2, 3, 4].map((n) => (
            <option key={n} value={n}>{t('search.baths', { count: n })}</option>
          ))}
        </select>
      </div>

      <div className="mt-2.5 grid grid-cols-2 items-end gap-2.5 md:grid-cols-3 lg:gap-3">
        <div>
          <label htmlFor="search-check-in" className={labelClass}>
            {t('search.checkIn')} <span className="normal-case tracking-normal text-ink-400/80">· {t('search.optional')}</span>
          </label>
          <input
            id="search-check-in"
            type="date"
            name="check_in"
            disabled={flexible}
            className={`${fieldClass} disabled:cursor-not-allowed disabled:opacity-40`}
            aria-label={t('search.checkIn')}
          />
        </div>
        <div>
          <label htmlFor="search-check-out" className={labelClass}>
            {t('search.checkOut')} <span className="normal-case tracking-normal text-ink-400/80">· {t('search.optional')}</span>
          </label>
          <input
            id="search-check-out"
            type="date"
            name="check_out"
            disabled={flexible}
            className={`${fieldClass} disabled:cursor-not-allowed disabled:opacity-40`}
            aria-label={t('search.checkOut')}
          />
        </div>
        <label className="col-span-2 flex cursor-pointer select-none items-center gap-2.5 rounded-xl border border-ink-100 bg-sand-50 px-3.5 py-3 text-sm text-ink-600 transition-colors hover:border-ocean-300 md:col-span-1 dark:border-ink-700 dark:bg-ink-800 dark:text-sand-100">
          <input
            type="checkbox"
            checked={flexible}
            onChange={(e) => setFlexible(e.target.checked)}
            className="h-4 w-4 shrink-0 accent-ocean-600"
          />
          {t('search.imFlexible')}
        </label>
      </div>

      <motion.button
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.985 }}
        type="submit"
        className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#ececf0] py-3.5 text-sm font-semibold text-ink-950 transition-colors hover:bg-white"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
        </svg>
        {t('search.searchProperties')}
      </motion.button>
    </motion.form>
  );
};

export default SearchBar;
