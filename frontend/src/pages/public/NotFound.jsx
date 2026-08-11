import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound = () => {
  return (
    <div className="pt-24 pb-16 bg-[#F8FAFC] dark:bg-gray-900 min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center px-6"
      >
        <p className="text-8xl md:text-9xl font-extrabold text-[#38BDF8]/20">404</p>
        <h1 className="mt-4 text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Page Not Found</h1>
        <p className="mt-3 text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          The page you are looking for doesn't exist or may have been moved.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#38BDF8] hover:bg-[#0EA5E9] text-white font-semibold transition-colors"
        >
          Back to Home
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
