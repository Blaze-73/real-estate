import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { fetchWishlist, toggleWishlist } from '../../store/slices/wishlistSlice';
import formatPrice from '../../utils/formatPrice';
import { amenityIcon } from '../../constants/amenities';

const getFavorites = () => {
  try {
    return JSON.parse(localStorage.getItem('favorites')) || [];
  } catch {
    return [];
  }
};

const PropertyCard = ({ property, priceMode = 'night', nights = 0 }) => {
  const { id, title, slug, price, type, bedrooms, bathrooms, surface, location, images, cover, nightly_price, monthly_price, cleaning_fee, instant_book } =
    property || {};
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const settings = useSelector((state) => state.settings.settings) || {};
  const isLoggedIn = useSelector((state) => !!state.auth.token);
  const wishlistSlugs = useSelector((state) => state.wishlist.slugs);
  const wishlistLoaded = useSelector((state) => state.wishlist.loaded);
  const whatsapp = settings?.whatsapp_number || '212XXXXXXXXX';
  const ratingScore = property?.rating_score || 0;
  const reviewsCount = property?.reviews_count || 0;
  const bookingsThisMonth = property?.bookings_this_month || 0;
  const cancellationPolicy = property?.cancellation_policy || '';
  const hasFreeCancellation = /free/i.test(cancellationPolicy);
  const coverImage = cover || images?.[0] || 'https://placehold.co/600x400/0B141B/D7C7A9?text=Asilah';
  const [favorites, setFavorites] = useState(getFavorites);
  const key = slug || id;
  const isFav = isLoggedIn ? wishlistSlugs.includes(key) : favorites.includes(key);

  useEffect(() => {
    if (isLoggedIn && !wishlistLoaded) dispatch(fetchWishlist());
  }, [isLoggedIn, wishlistLoaded, dispatch]);

  const toggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLoggedIn) {
      dispatch(toggleWishlist(key));
      return;
    }
    const next = isFav ? favorites.filter((k) => k !== key) : [...favorites, key];
    localStorage.setItem('favorites', JSON.stringify(next));
    setFavorites(next);
  };

  const whatsappUrl = `https://wa.me/${whatsapp}?text=${encodeURIComponent(
    t('propertyCard.whatsappIntro', { title })
  )}`;

  const totalPrice =
    priceMode === 'total' && nights >= 1
      ? (() => {
          const rate =
            nights >= 28 && Number(monthly_price) > 0
              ? Number(monthly_price) / 30.4375
              : Number(nightly_price) > 0
                ? Number(nightly_price)
                : Number(price);
          return rate * nights + Number(cleaning_fee || 0);
        })()
      : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-ink-100 transition-shadow duration-300 hover:shadow-2xl hover:shadow-ink-950/10 dark:bg-ink-900 dark:ring-ink-800"
    >
      <Link to={`/properties/${slug || id}`} className="flex flex-1 flex-col">
        <div className="relative h-60 overflow-hidden">
          <img
            src={coverImage}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-ink-950/0 to-ink-950/10" />

          <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {type && (
              <span className="rounded-full bg-ink-950/70 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-sand-100 backdrop-blur-md">
                {t(`types.${type}`, { defaultValue: type })}
              </span>
            )}

            {instant_book && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-ocean-600/90 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {t('propertyCard.instantBook')}
              </span>
            )}
          </div>

          {bookingsThisMonth >= 2 && (
            <div className="absolute left-3 top-20">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-terra-500/90 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M16 4h4v4M4 20l16-16M12 8V4m4 4V4" />
                </svg>
                {t('propertyCard.bookedThisMonth', { count: bookingsThisMonth })}              </span>
            </div>
          )}

          <button
            onClick={toggleFavorite}
            aria-label={isFav ? t('propertyCard.removeFromFavorites') : t('propertyCard.addToFavorites')}
            aria-pressed={isFav}
            className={`absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full backdrop-blur-md transition-colors ${
              isFav
                ? 'bg-terra-500 text-white'
                : 'bg-ink-950/50 text-white hover:bg-ink-950/80'
            }`}
          >
            <svg
              className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${isFav ? 'fill-white' : 'fill-none'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          <div className="absolute bottom-3 left-4">
            {totalPrice !== null ? (
              <span className="flex flex-col leading-tight">
                <span className="font-display text-2xl font-semibold text-white drop-shadow-sm">
                  {formatPrice(totalPrice)}
                </span>
                <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-sand-100/80">
                  {t('properties.nightCount', { count: nights })} {t('properties.totalSuffix')}
                </span>
              </span>
            ) : (
              <span className="font-display text-2xl font-semibold text-white drop-shadow-sm">
                {formatPrice(price)}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
            }}
            aria-label={t('propertyCard.askOnWhatsApp', { title })}
            className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform duration-300 hover:scale-110"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </button>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="line-clamp-1 font-display text-lg font-semibold tracking-tight text-ink-900 dark:text-sand-50">
            {title || t('propertyCard.property')}
          </h3>

          {reviewsCount > 0 && (
            <p className="mt-1.5 flex items-center gap-1.5 text-sm text-ink-600 dark:text-ink-300">
              <svg className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-semibold text-ink-900 dark:text-sand-50">{ratingScore.toFixed(1)}</span>
              <span className="text-ink-400 dark:text-ink-400">·</span>
              <span>{t('propertyCard.review', { count: reviewsCount })}</span>
            </p>
          )}

          {location && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-ink-400 dark:text-ink-300">
              <svg className="h-3.5 w-3.5 shrink-0 text-ocean-500 dark:text-ocean-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {location}
            </p>
          )}

          {hasFreeCancellation && (
            <p className="mt-2 inline-flex items-center gap-1.5 self-start rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t('propertyCard.freeCancellation')}
            </p>
          )}

          {(property?.amenities?.length > 0) && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {property.amenities.slice(0, 3).map((key) => (
                <span
                  key={key}
                  className="inline-flex items-center gap-1 rounded-full bg-ocean-50 px-2 py-0.5 text-[11px] font-medium text-ocean-700 dark:bg-ink-800 dark:text-ocean-300"
                  title={t(`amenities.${key}`, { defaultValue: key })}
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d={amenityIcon(key)} />
                  </svg>
                  {t(`amenities.${key}`, { defaultValue: key })}
                </span>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-center border-t border-ink-100 pt-4 dark:border-ink-800">
            <div className="flex flex-1 items-center gap-4 text-sm text-ink-500 dark:text-ink-300">
              <span className="flex items-center gap-1.5">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                {bedrooms || 0}
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {bathrooms || 0}
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                </svg>
                {surface || 0} m&sup2;
              </span>
            </div>
            <span className="flex items-center gap-1 text-sm font-semibold text-ocean-600 transition-all duration-300 group-hover:translate-x-0.5 dark:text-ocean-300" aria-hidden="true">
              {t('propertyCard.details')}
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14m-6-6 6 6-6 6" />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
};

export default PropertyCard;