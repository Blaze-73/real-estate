import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchProperties } from '../../store/slices/propertySlice';
import PropertyCard from '../../components/common/PropertyCard';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest' },
  { value: 'createdAt', label: 'Oldest' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
];

const FilterControls = ({ filters, onChange }) => (
  <div className="space-y-4">
    <div>
      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</label>
      <select name="type" value={filters.type} onChange={onChange} className="mt-1 w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8]">
        <option value="">All Types</option>
        <option value="apartment">Apartment</option>
        <option value="villa">Villa</option>
        <option value="house">House</option>
        <option value="studio">Studio</option>
        <option value="office">Office</option>
      </select>
    </div>
    <div>
      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Min Price</label>
      <input type="number" name="min_price" value={filters.min_price} onChange={onChange} placeholder="0" className="mt-1 w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8]" />
    </div>
    <div>
      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Max Price</label>
      <input type="number" name="max_price" value={filters.max_price} onChange={onChange} placeholder="Any" className="mt-1 w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8]" />
    </div>
    <div>
      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bedrooms</label>
      <select name="bedrooms" value={filters.bedrooms} onChange={onChange} className="mt-1 w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8]">
        <option value="">Any</option>
        {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}+</option>)}
      </select>
    </div>
    <div>
      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bathrooms</label>
      <select name="bathrooms" value={filters.bathrooms} onChange={onChange} className="mt-1 w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8]">
        <option value="">Any</option>
        {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}+</option>)}
      </select>
    </div>
  </div>
);

const Properties = () => {
  const dispatch = useDispatch();
  const { properties, loading, error, pagination } = useSelector((state) => state.properties);
  const [searchParams, setSearchParams] = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const readSort = () => searchParams.get('sort') || '-createdAt';

  const filters = {
    type: searchParams.get('type') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    bathrooms: searchParams.get('bathrooms') || '',
    page: Number(searchParams.get('page')) || 1,
    sort: readSort(),
  };

  const [sort_by, sort_order] = filters.sort.startsWith('-')
    ? [filters.sort.slice(1), 'desc']
    : [filters.sort, 'asc'];

  const { type, min_price, max_price, bedrooms, bathrooms, page } = filters;

  useEffect(() => {
    const params = {
      type,
      min_price,
      max_price,
      bedrooms,
      bathrooms,
      sort_by,
      sort_order,
      page,
      per_page: 9,
    };
    Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });
    dispatch(fetchProperties(params));
  }, [dispatch, type, min_price, max_price, bedrooms, bathrooms, sort_by, sort_order, page]);

  const updateParam = (name, value) => {
    const next = new URLSearchParams(searchParams);
    if (!value) {
      next.delete(name);
    } else {
      next.set(name, value);
    }
    if (name !== 'page') next.set('page', '1');
    setSearchParams(next);
  };

  const handleFilterChange = (e) => {
    updateParam(e.target.name, e.target.value);
  };

  const clearFilters = () => {
    const next = new URLSearchParams();
    setSearchParams(next);
  };

  return (
    <div className="pt-24 pb-16 bg-[#F8FAFC] dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Properties in Asilah</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Find your perfect property from our curated collection</p>
        </motion.div>

        <div className="flex gap-6">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-white dark:bg-[#1E293B] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
                <button onClick={clearFilters} className="text-xs text-[#38BDF8] hover:underline">Clear all</button>
              </div>
              <FilterControls filters={filters} onChange={handleFilterChange} />
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-6 gap-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {pagination.total || 0} properties found
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDrawerOpen(true)}
                  className="lg:hidden px-3 py-1.5 rounded-xl bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M6 12h12M10 20h4" />
                  </svg>
                  Filters
                </button>
                <label className="hidden lg:block text-xs text-gray-500 dark:text-gray-400">Sort:</label>
                <select
                  name="sort"
                  value={filters.sort}
                  onChange={handleFilterChange}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8]"
                >
                  {SORT_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
            </div>

            {error && (
              <div className="p-4 mb-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
                : properties.map((property) => (
                    <PropertyCard key={property.id || property._id} property={property} />
                  ))}
            </div>

            {!loading && properties.length === 0 && (
              <div className="text-center py-16">
                <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No properties found</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Try adjusting your filters.</p>
              </div>
            )}

            {pagination.pages > 1 && (
              <nav className="flex justify-center gap-2 mt-10" aria-label="Pagination">
                {Array.from({ length: pagination.pages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => updateParam('page', String(i + 1))}
                    aria-label={`Go to page ${i + 1}`}
                    aria-current={filters.page === i + 1 ? 'page' : undefined}
                    className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${
                      filters.page === i + 1
                        ? 'bg-[#38BDF8] text-white'
                        : 'bg-white dark:bg-[#1E293B] text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </nav>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-[#0F172A] z-50 overflow-y-auto lg:hidden"
            >
              <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300"
                  aria-label="Close filters"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-5">
                <FilterControls
                  filters={filters}
                  onChange={(e) => handleFilterChange(e)}
                />
                <button
                  onClick={clearFilters}
                  className="mt-4 w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium"
                >
                  Clear all
                </button>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="mt-2 w-full py-2.5 rounded-xl bg-[#38BDF8] text-white text-sm font-semibold"
                >
                  Show Results
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Properties;
