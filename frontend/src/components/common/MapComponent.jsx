import { motion } from 'framer-motion';

const MapComponent = ({ location = 'Asilah, Morocco' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-2xl overflow-hidden bg-[#1E293B] h-[350px] relative"
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
        <svg className="w-16 h-16 text-[#38BDF8] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <h3 className="text-xl font-semibold mb-2">{location}</h3>
        <p className="text-gray-400 text-center text-sm">Map integration — Google Maps will render here with pins of our properties in Asilah</p>
        <div className="mt-4 px-6 py-2 rounded-full bg-[#38BDF8]/20 border border-[#38BDF8]/40 text-[#38BDF8] text-sm">
          Interactive Map Coming Soon
        </div>
      </div>
    </motion.div>
  );
};

export default MapComponent;
