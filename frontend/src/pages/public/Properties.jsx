import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { fetchProperties } from '../../store/slices/propertySlice';
import PropertyCard from '../../components/common/PropertyCard';
import PropertiesMap from '../../components/common/PropertiesMap';
import savedSearchService from '../../services/savedSearchService';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import Seo from '../../components/common/Seo';

const TYPE_CHIPS = ['apartment', 'villa', 'house', 'studio'];

const FilterControls = ({ filters, onChange, priceMode = 'night' }) => {
  const { t } = useTranslation();
  const priceSuffix = priceMode === 'total' ? ` · ${t('properties.priceTotal')}` : '';
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('properties.type')}</label>
        <select name="type" value={filters.type} onChange={onChange} className="mt-1 w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8]">
          <option value="">{t('properties.allTypes')}</option>
          <option value="apartment">{t('types.apartment')}</option>
          <option value="villa">{t('types.villa')}</option>
          <option value="house">{t('types.house')}</option>
          <option value="studio">{t('types.studio')}</option>
          <option value="office">{t('types.office')}</option>
        </select>
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('properties.minPrice')}{priceSuffix}</label>
        <input type="number" name="min_price" value={filters.min_price} onChange={onChange} placeholder="0" className="mt-1 w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8]" />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('properties.maxPrice')}{priceSuffix}</label>
        <input type="number" name="max_price" value={filters.max_price} onChange={onChange} placeholder={t('properties.any')} className="mt-1 w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8]" />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('properties.bedrooms')}</label>
        <select name="bedrooms" value={filters.bedrooms} onChange={onChange} className="mt-1 w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8]">
          <option value="">{t('properties.any')}</option>
          {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}+</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('properties.bathrooms')}</label>
        <select name="bathrooms" value={filters.bathrooms} onChange={onChange} className="mt-1 w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8]">
          <option value="">{t('properties.any')}</option>
          {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}+</option>)}
        </select>
      </div>
    </div>
  );
};

const Properties = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { properties, loading, error, pagination } = useSelector((state) => state.properties);
  const [searchParams, setSearchParams] = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const token = useSelector((state) => state.auth?.token);
  const [saveState, setSaveState] = useState({ status: 'idle', message: '' });

  const handleMapHover = useCallback((id) => setActiveId(id), []);
  const handleMapSelect = useCallback((id) => navigate(`/properties/${id}`), [navigate]);

  const SORT_OPTIONS = [
    { value: '-createdAt', label: t('properties.newest') },
    { value: 'createdAt', label: t('properties.oldest') },
    { value: 'price', label: t('properties.priceLowHigh') },
    { value: '-price', label: t('properties.priceHighLow') },
  ];

  const readSort = () => searchParams.get('sort') || '-createdAt';

  const check_in = searchParams.get('check_in') || '';
  const check_out = searchParams.get('check_out') || '';
  const rawPriceMode = searchParams.get('price_mode') === 'total' ? 'total' : 'night';

  const nights = useMemo(() => {
    if (!check_in || !check_out) return 0;
    const start = new Date(`${check_in}T00:00:00`);
    const end = new Date(`${check_out}T00:00:00`);
    const diff = Math.round((end - start) / 86400000);
    return diff > 0 ? diff : 0;
  }, [check_in, check_out]);

  const priceMode = nights >= 1 ? rawPriceMode : 'night';

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
    if (check_in && check_out) {
      params.check_in = check_in;
      params.check_out = check_out;
      if (priceMode === 'total') {
        params.price_mode = 'total';
        params.nights = nights;
      }
    }
    Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });
    dispatch(fetchProperties(params));
  }, [dispatch, type, min_price, max_price, bedrooms, bathrooms, sort_by, sort_order, page, check_in, check_out, priceMode, nights]);

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

  const handleSaveSearch = async () => {
    if (!token) {
      navigate(`/login?from=${encodeURIComponent(`/properties?${searchParams.toString()}`)}`);
      return;
    }
    setSaveState({ status: 'saving', message: '' });
    const payload = {
      type: type || undefined,
      min_price: min_price || undefined,
      max_price: max_price || undefined,
      bedrooms: bedrooms || undefined,
      bathrooms: bathrooms || undefined,
      check_in: check_in || undefined,
      check_out: check_out || undefined,
      price_mode: priceMode === 'total' ? 'total' : undefined,
      nights: priceMode === 'total' ? nights : undefined,
      sort_by,
      sort_order,
    };
    Object.keys(payload).forEach((k) => { if (!payload[k]) delete payload[k]; });
    try {
      const saved = await savedSearchService.store({ filters: payload });
      setSaveState({ status: 'done', message: t('properties.searchSaved', { name: saved.name || '' }) });
      window.setTimeout(() => setSaveState({ status: 'idle', message: '' }), 4000);
    } catch (err) {
      setSaveState({ status: 'error', message: err.response?.data?.message || t('common.error') });
    }
  };

  const toggleTypeChip = (value) => {
    updateParam('type', type === value ? '' : value);
  };

  const setPriceMode = (mode) => {
    updateParam('price_mode', mode === 'total' ? 'total' : '');
  };

  const clearDates = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('check_in');
    next.delete('check_out');
    next.delete('price_mode');
    next.delete('nights');
    next.set('page', '1');
    setSearchParams(next);
  };

  return (
    <div className="pt-24 pb-16 bg-[#F8FAFC] dark:bg-gray-900 min-h-screen">
      <Seo
        title={t('properties.title')}
        description={t('properties.description')}
        canonical="/properties"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{t('properties.pageTitle')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">{t('properties.pageSubtitle')}</p>
        </motion.div>

        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mr-1">{t('properties.type')}</span>
          {TYPE_CHIPS.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => toggleTypeChip(v)}
              aria-pressed={type === v}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                type === v
                  ? 'bg-[#38BDF8] text-white border-[#38BDF8]'
                  : 'bg-white dark:bg-[#1E293B] text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-[#38BDF8]'
              }`}
            >
              {t(`types.${v}`)}
            </button>
          ))}

          {nights >= 1 && (
            <>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#38BDF8]/10 text-[#38BDF8] text-sm font-medium border border-[#38BDF8]/20">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {check_in} → {check_out} · {t('properties.nightCount', { count: nights })}
                <button
                  type="button"
                  onClick={clearDates}
                  aria-label={t('properties.removeDates')}
                  className="grid h-5 w-5 place-items-center rounded-full bg-[#38BDF8]/15 text-[#38BDF8] hover:bg-[#38BDF8]/30 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>

              <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 ml-1" role="group" aria-label={t('properties.priceTotal')}>
                <button
                  type="button"
                  onClick={() => setPriceMode('night')}
                  aria-pressed={priceMode === 'night'}
                  className={`px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    priceMode === 'night'
                      ? 'bg-[#38BDF8] text-white'
                      : 'bg-white dark:bg-[#1E293B] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {t('properties.pricePerNight')}
                </button>
                <button
                  type="button"
                  onClick={() => setPriceMode('total')}
                  aria-pressed={priceMode === 'total'}
                  className={`px-3.5 py-1.5 text-sm font-medium transition-colors border-l border-gray-200 dark:border-gray-700 ${
                    priceMode === 'total'
                      ? 'bg-[#38BDF8] text-white'
                      : 'bg-white dark:bg-[#1E293B] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {t('properties.priceTotal')}
                </button>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-6">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-white dark:bg-[#1E293B] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">{t('properties.filters')}</h3>
                <button onClick={clearFilters} className="text-xs text-[#38BDF8] hover:underline">{t('properties.clearAll')}</button>
              </div>
              <FilterControls filters={filters} onChange={handleFilterChange} priceMode={priceMode} />
            </div>
          </aside>

          <div className={`flex-1 min-w-0 ${mapOpen ? 'hidden lg:block' : ''}`}>
            <div className="flex items-center justify-between mb-6 gap-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('properties.resultsFound', { count: pagination.total || 0 })}
              </p>
              <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap">
                <button
                  onClick={() => setDrawerOpen(true)}
                  className="lg:hidden px-3 py-1.5 rounded-xl bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M6 12h12M10 20h4" />
                  </svg>
                  {t('properties.filters')}
                </button>
                <button
                  type="button"
                  onClick={handleSaveSearch}
                  disabled={saveState.status === 'saving'}
                  title={t('properties.saveSearchTitle')}
                  className="px-3 py-1.5 rounded-xl bg-[#38BDF8]/10 text-[#0EA5E9] dark:text-[#38BDF8] border border-[#38BDF8]/40 text-sm font-medium flex items-center gap-1.5 hover:bg-[#38BDF8]/20 transition-colors disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 3h14a1 1 0 011 1v17l-8-4.5L4 21V4a1 1 0 011-1z" />
                  </svg>
                  {saveState.status === 'saving' ? t('properties.savingSearch') : t('properties.saveSearch')}
                </button>
                {saveState.message && (
                  <span className={`text-xs ${saveState.status === 'error' ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {saveState.message}
                  </span>
                )}
                <div className="hidden lg:flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700" role="group" aria-label={t('properties.map')}>
                  <button
                    type="button"
                    onClick={() => setMapOpen(false)}
                    aria-pressed={!mapOpen}
                    className={`px-3.5 py-1.5 text-sm font-medium flex items-center gap-1.5 transition-colors ${
                      !mapOpen
                        ? 'bg-[#38BDF8] text-white'
                        : 'bg-white dark:bg-[#1E293B] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    {t('properties.list')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapOpen(true)}
                    aria-pressed={mapOpen}
                    className={`px-3.5 py-1.5 text-sm font-medium flex items-center gap-1.5 transition-colors border-l border-gray-200 dark:border-gray-700 ${
                      mapOpen
                        ? 'bg-[#38BDF8] text-white'
                        : 'bg-white dark:bg-[#1E293B] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    {t('properties.map')}
                  </button>
                </div>
                <label className="hidden lg:block text-xs text-gray-500 dark:text-gray-400">{t('properties.sort')}</label>
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

            <div className={`grid grid-cols-1 md:grid-cols-2 ${mapOpen ? '' : 'xl:grid-cols-3'} gap-6`}>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
                : properties.map((property) => {
                    const key = String(property.slug || property.id);
                    return (
                      <div
                        key={key}
                        onMouseEnter={() => setActiveId(key)}
                        onMouseLeave={() => setActiveId(null)}
                        className={`rounded-2xl transition-shadow ${
                          activeId === key ? 'ring-2 ring-[#38BDF8] shadow-lg shadow-[#38BDF8]/10' : ''
                        }`}
                      >
                        <PropertyCard property={property} priceMode={priceMode} nights={nights} />
                      </div>
                    );
                  })}
            </div>

            {!loading && properties.length === 0 && (
              <div className="text-center py-16">
                <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('properties.noProperties')}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{t('properties.adjustFilters')}</p>
              </div>
            )}

            {pagination.pages > 1 && (
              <nav className="flex justify-center gap-2 mt-10" aria-label={t('properties.paginationAria')}>
                {Array.from({ length: pagination.pages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => updateParam('page', String(i + 1))}
                    aria-label={t('properties.goToPage', { count: i + 1 })}
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

          <AnimatePresence>
            {mapOpen && (
              <motion.div
                key="map-panel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full lg:w-[46%] shrink-0"
              >
                <div className="sticky top-24 h-[68vh] lg:h-[calc(100vh-8rem)] overflow-hidden rounded-2xl bg-ink-100 ring-1 ring-ink-100 dark:bg-ink-800 dark:ring-ink-800">
                  <PropertiesMap
                    properties={properties}
                    activeId={activeId}
                    onHover={handleMapHover}
                    onSelect={handleMapSelect}
                    priceMode={priceMode}
                    nights={nights}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
                <h3 className="font-semibold text-gray-900 dark:text-white">{t('properties.filters')}</h3>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300"
                  aria-label={t('properties.closeFilters')}
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
                  priceMode={priceMode}
                />
                <button
                  onClick={clearFilters}
                  className="mt-4 w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium"
                >
                  {t('properties.clearAll')}
                </button>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="mt-2 w-full py-2.5 rounded-xl bg-[#38BDF8] text-white text-sm font-semibold"
                >
                  {t('properties.showResults')}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setMapOpen((v) => !v)}
        className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-30 inline-flex items-center gap-2 rounded-full bg-[#38BDF8] text-white px-5 py-3 text-sm font-semibold shadow-lg shadow-[#38BDF8]/30 active:scale-95 transition-transform"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {mapOpen ? (
            <path d="M4 6h16M4 12h16M4 18h16" />
          ) : (
            <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          )}
        </svg>
        {mapOpen ? t('properties.showList') : t('properties.showOnMap')}
      </button>
    </div>
  );
};

export default Properties;