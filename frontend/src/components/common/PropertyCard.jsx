import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const getFavorites = () => {
  try {
    return JSON.parse(localStorage.getItem('favorites')) || [];
  } catch {
    return [];
  }
};

const PropertyCard = ({ property }) => {
  const { id, title, slug, price, type, bedrooms, bathrooms, surface, location, images, cover } = property || {};
  const coverImage = cover || images?.[0] || 'https://placehold.co/600x400/0F172A/38BDF8?text=Asilah';
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
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.4 }}
      className="group relative rounded-2xl overflow-hidden bg-white dark:bg-[#1E293B] shadow-lg hover:shadow-2xl transition-shadow duration-300"
    >
      <Link to={`/properties/${slug || id}`}>
        <div className="relative h-56 overflow-hidden">
          <img
            src={coverImage}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute top-3 left-3 flex gap-2">
            {type && (
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-[#38BDF8] text-white backdrop-blur-sm">
                {type}
              </span>
            )}
          </div>
          <div className="absolute top-3 right-3">
            <button
              onClick={toggleFavorite}
              aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
              className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/40 transition-colors"
            >
              <svg className={`w-5 h-5 transition-colors ${isFav ? 'text-red-500 fill-red-500' : 'text-white'}`} fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
          <div className="absolute bottom-3 left-3">
            <span className="text-xl font-bold text-white">
              {price ? `${price.toLocaleString()} MAD` : 'Contact'}
            </span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">{title || 'Property'}</h3>
          {location && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {location}
            </p>
          )}
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              {bedrooms || 0} Beds
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {bathrooms || 0} Baths
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
              </svg>
              {surface || 0} m²
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default PropertyCard;
