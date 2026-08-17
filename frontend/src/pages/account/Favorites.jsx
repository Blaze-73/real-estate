import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import wishlistService from '../../services/wishlistService';
import { fetchWishlist } from '../../store/slices/wishlistSlice';
import PropertyCard from '../../components/common/PropertyCard';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import Seo from '../../components/common/Seo';

const Favorites = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const wishlistSlugs = useSelector((state) => state.wishlist.slugs);
  const wishlistLoaded = useSelector((state) => state.wishlist.loaded);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!wishlistLoaded) dispatch(fetchWishlist());
    let cancelled = false;
    wishlistService
      .getAll()
      .then((data) => {
        if (!cancelled) setItems(Array.isArray(data) ? data : []);
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
  }, [wishlistLoaded, dispatch, t]);

  const visible = items.filter((p) => wishlistSlugs.includes(p.slug));

  return (
    <div className="min-h-[70vh] mx-auto max-w-7xl px-5 py-10 sm:px-8">
      <Seo title={t('favorites.title')} description={t('favorites.subtitle')} />
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-900 dark:text-sand-50">{t('favorites.title')}</h1>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-300">{t('favorites.subtitle')}</p>
        </div>
        {!loading && visible.length > 0 && (
          <span className="rounded-full bg-ocean-50 px-4 py-1.5 text-sm font-semibold text-ocean-700 dark:bg-ink-800 dark:text-ocean-300">
            {t('favorites.count', { count: visible.length })}
          </span>
        )}
      </header>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : visible.length === 0 ? (
        <div className="py-24 text-center">
          <svg className="mx-auto mb-4 h-16 w-16 text-ink-200 dark:text-ink-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <h2 className="font-display text-xl font-semibold text-ink-900 dark:text-sand-50">{t('favorites.empty')}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-500 dark:text-ink-300">{t('favorites.emptyHint')}</p>
          <Link
            to="/properties"
            className="mt-6 inline-block rounded-xl bg-[#ececf0] px-6 py-3 text-sm font-semibold text-ink-950 transition-colors hover:bg-white"
          >
            {t('favorites.browse')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((property) => (
            <PropertyCard key={property.slug || property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
