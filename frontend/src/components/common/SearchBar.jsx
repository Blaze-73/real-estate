import { motion } from 'framer-motion';

const fieldClass =
  'w-full rounded-xl border border-ink-100 bg-sand-50 px-3.5 py-3 text-sm text-ink-900 placeholder-ink-400 outline-none transition-colors focus:border-ocean-500 focus:ring-2 focus:ring-ocean-500/25 dark:border-ink-700 dark:bg-ink-800 dark:text-sand-50 dark:placeholder-ink-300';

const SearchBar = ({ onSearch, className = '' }) => {
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
        <select name="type" defaultValue="" aria-label="Property type" className={fieldClass}>
          <option value="" disabled>Property type</option>
          <option value="apartment">Apartment</option>
          <option value="villa">Villa</option>
          <option value="house">House</option>
          <option value="studio">Studio</option>
          <option value="office">Office</option>
        </select>
        <input
          type="number"
          name="min_price"
          min="0"
          placeholder="Min price"
          aria-label="Minimum price"
          className={fieldClass}
        />
        <input
          type="number"
          name="max_price"
          min="0"
          placeholder="Max price"
          aria-label="Maximum price"
          className={fieldClass}
        />
        <select name="bedrooms" defaultValue="" aria-label="Number of bedrooms" className={fieldClass}>
          <option value="" disabled>Bedrooms</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>{n}+ beds</option>
          ))}
        </select>
        <select name="bathrooms" defaultValue="" aria-label="Number of bathrooms" className={fieldClass}>
          <option value="" disabled>Bathrooms</option>
          {[1, 2, 3, 4].map((n) => (
            <option key={n} value={n}>{n}+ baths</option>
          ))}
        </select>
      </div>
      <motion.button
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.985 }}
        type="submit"
        className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl bg-ocean-600 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-ocean-500"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
        </svg>
        Search properties
      </motion.button>
    </motion.form>
  );
};

export default SearchBar;