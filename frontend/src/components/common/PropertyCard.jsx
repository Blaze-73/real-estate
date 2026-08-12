import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import formatPrice from '../../utils/formatPrice';

const getFavorites = () => {
  try {
    return JSON.parse(localStorage.getItem('favorites')) || [];
  } catch {
    return [];
  }
};

const PropertyCard = ({ property }) => {
  const { id, title, slug, price, type, bedrooms, bathrooms, surface, location, images, cover } =
    property || {};
  const coverImage = cover || images?.[0] || 'https://placehold.co/600x400/0B141B/D7C7A9?text=Asilah';
  const [favorites, setFavorites] = useState(getFavorites);
  const key = slug || id;
  const isFav = favorites.includes(key);

  const toggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const next = isFav ? favorites.filter((k) => k !== key) : [...favorites, key];
    localStorage.setItem('favorites', JSON.stringify(next));
    setFavorites(next);
  };

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

          <div className="absolute left-3 top-3">
            {type && (
              <span className="rounded-full bg-ink-950/70 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-sand-100 backdrop-blur-md">
                {type}
              </span>
            )}
          </div>

          <button
            onClick={toggleFavorite}
            aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
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
            <span className="font-display text-2xl font-semibold text-white drop-shadow-sm">
              {formatPrice(price)}
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="line-clamp-1 font-display text-lg font-semibold tracking-tight text-ink-900 dark:text-sand-50">
            {title || 'Property'}
          </h3>

          {location && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-ink-400 dark:text-ink-300">
              <svg className="h-3.5 w-3.5 shrink-0 text-ocean-500 dark:text-ocean-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {location}
            </p>
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
              Details
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