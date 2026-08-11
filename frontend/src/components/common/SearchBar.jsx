import { useState } from 'react';
import { motion } from 'framer-motion';

const SearchBar = ({ onSearch, className = '' }) => {
  const [filters, setFilters] = useState({
    type: '',
    min_price: '',
    max_price: '',
    bedrooms: '',
    bathrooms: '',
  });

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(filters);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
      onSubmit={handleSubmit}
      className={`bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 md:p-6 ${className}`}
    >
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <select
          name="type"
          value={filters.type}
          onChange={handleChange}
          className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:border-[#38BDF8] text-sm"
        >
          <option value="" className="text-gray-900">Property Type</option>
          <option value="apartment" className="text-gray-900">Apartment</option>
          <option value="villa" className="text-gray-900">Villa</option>
          <option value="house" className="text-gray-900">House</option>
          <option value="studio" className="text-gray-900">Studio</option>
          <option value="office" className="text-gray-900">Office</option>
        </select>
        <input
          type="number"
          name="min_price"
          placeholder="Min Price"
          value={filters.min_price}
          onChange={handleChange}
          className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:border-[#38BDF8] text-sm"
        />
        <input
          type="number"
          name="max_price"
          placeholder="Max Price"
          value={filters.max_price}
          onChange={handleChange}
          className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:border-[#38BDF8] text-sm"
        />
        <select
          name="bedrooms"
          value={filters.bedrooms}
          onChange={handleChange}
          className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:border-[#38BDF8] text-sm"
        >
          <option value="" className="text-gray-900">Bedrooms</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n} className="text-gray-900">{n}+ Beds</option>
          ))}
        </select>
        <select
          name="bathrooms"
          value={filters.bathrooms}
          onChange={handleChange}
          className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:border-[#38BDF8] text-sm"
        >
          <option value="" className="text-gray-900">Bathrooms</option>
          {[1, 2, 3, 4].map((n) => (
            <option key={n} value={n} className="text-gray-900">{n}+ Baths</option>
          ))}
        </select>
      </div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        className="mt-3 w-full py-2.5 rounded-xl bg-[#38BDF8] hover:bg-[#0EA5E9] text-white font-semibold transition-colors text-sm"
      >
        Search Properties
      </motion.button>
    </motion.form>
  );
};

export default SearchBar;
