import { motion } from 'framer-motion';

const MapComponent = ({ location = 'Asilah, Morocco', latitude = 35.462792, longitude = -6.035159 }) => {
  const query = encodeURIComponent(location);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-2xl overflow-hidden bg-[#1E293B] relative"
    >
      <iframe
        title={`Map of ${location}`}
        src={`https://www.google.com/maps?q=${query}&z=14&output=embed`}
        className="w-full h-[350px] border-0"
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
      />
      {latitude && longitude && (
        <p className="sr-only">{`Latitude ${latitude}, Longitude ${longitude}`}</p>
      )}
    </motion.div>
  );
};

export default MapComponent;