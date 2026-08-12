import { motion } from 'framer-motion';

const MapComponent = ({ location = 'Asilah, Morocco', latitude = 35.462792, longitude = -6.035159 }) => {
  const query = encodeURIComponent(location);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative overflow-hidden rounded-[1.75rem] bg-ink-100 ring-1 ring-ink-100 dark:bg-ink-800 dark:ring-ink-800"
    >
      <iframe
        title={`Map of ${location}`}
        src={`https://www.google.com/maps?q=${query}&z=14&output=embed`}
        className="h-[360px] w-full border-0"
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
      />
      <span className="pointer-events-none absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-ink-950/75 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-sand-100 backdrop-blur-md">
        <span className="h-2 w-2 rounded-full bg-ocean-400" />
        Asilah &middot; 35.46, -6.03
      </span>
      {latitude && longitude && (
        <p className="sr-only">{`Latitude ${latitude}, Longitude ${longitude}`}</p>
      )}
    </motion.div>
  );
};

export default MapComponent;