import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import savedSearchService from '../../services/savedSearchService';
import Seo from '../../components/common/Seo';

const buildResultsUrl = (filters = {}) => {
  const p = new URLSearchParams();
  if (filters.type) p.set('type', filters.type);
  if (filters.min_price) p.set('min_price', filters.min_price);
  if (filters.max_price) p.set('max_price', filters.max_price);
  if (filters.bedrooms) p.set('bedrooms', filters.bedrooms);
  if (filters.bathrooms) p.set('bathrooms', filters.bathrooms);
  if (filters.check_in) p.set('check_in', filters.check_in);
  if (filters.check_out) p.set('check_out', filters.check_out);
  if (filters.price_mode === 'total') p.set('price_mode', 'total');
  if (filters.sort_by) p.set('sort', filters.sort_order === 'desc' ? `-${filters.sort_by}` : filters.sort_by);
  const q = p.toString();
  return q ? `/properties?${q}` : '/properties';
};

const summaryFor = (t, filters = {}) => {
  const parts = [];
  if (filters.type) parts.push(t(`types.${filters.type}`));
  if (filters.city) parts.push(filters.city);
  if (filters.min_price && filters.max_price) parts.push(`${filters.min_price}â€“${filters.max_price}`);
  else if (filters.min_price) parts.push(`${filters.min_price}+`);
  else if (filters.max_price) parts.push(`â‰¤ ${filters.max_price}`);
  if (filters.bedrooms) parts.push(`${filters.bedrooms}+ ${t('properties.bedrooms').toLowerCase()}`);
  if (filters.bathrooms) parts.push(`${filters.bathrooms}+ ${t('properties.bathrooms').toLowerCase()}`);
  if (filters.check_in && filters.check_out) parts.push(`${filters.check_in} â†’ ${filters.check_out}`);
  return parts.length ? parts.join(' Â· ') : t('savedSearches.allProperties');
};

const SavedSearches = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth?.token);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    let cancelled = false;
    savedSearchService
      .getAll()
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || t('common.error'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token, navigate, t]);

  const toggleActive = async (item) => {
    setBusyId(item.id);
    try {
      await savedSearchService.update(item.id, { active: !item.active });
      setItems((prev) => prev.map((s) => (s.id === item.id ? { ...s, active: !s.active } : s)));
    } catch (err) {
      setError(err.response?.data?.message || t('common.error'));
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (item) => {
    if (!window.confirm(t('savedSearches.deleteConfirm'))) return;
    setBusyId(item.id);
    try {
      await savedSearchService.remove(item.id);
      setItems((prev) => prev.filter((s) => s.id !== item.id));
    } catch (err) {
      setError(err.response?.data?.message || t('common.error'));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-[70vh] max-w-5xl mx-auto px-4 py-10">
      <Seo title={t('savedSearches.title')} />
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{t('savedSearches.title')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">{t('savedSearches.subtitle')}</p>
      </header>

      {error && (
        <div className="p-4 mb-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-gray-100 dark:bg-ink-900 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3h14a1 1 0 011 1v17l-8-4.5L4 21V4a1 1 0 011-1z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('savedSearches.empty')}</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{t('savedSearches.emptyHint')}</p>
          <Link to="/properties" className="inline-block px-5 py-2.5 rounded-xl bg-[#ececf0] hover:bg-white text-ink-950 text-sm font-medium transition-colors">
            {t('savedSearches.browse')}
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item.id} className="rounded-2xl bg-white dark:bg-ink-900 border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">{item.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">{summaryFor(t, item.filters)}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full ${
                        item.active
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${item.active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                      {item.active ? t('savedSearches.active') : t('savedSearches.paused')}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">{t('savedSearches.lastAlert')}: {item.last_alert_at || 'â€”'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to={buildResultsUrl(item.filters)}
                    className="px-4 py-2 rounded-xl bg-[#ececf0]/10 text-[#52575d] dark:text-[#d9d9de] border border-[#9aa0a6]/40 text-sm font-medium hover:bg-[#ececf0]/20 transition-colors"
                  >
                    {t('savedSearches.viewResults')}
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleActive(item)}
                    disabled={busyId === item.id}
                    className="px-4 py-2 rounded-xl bg-white dark:bg-ink-900 border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    {item.active ? t('savedSearches.pause') : t('savedSearches.resume')}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(item)}
                    disabled={busyId === item.id}
                    aria-label={t('savedSearches.delete')}
                    className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SavedSearches;
