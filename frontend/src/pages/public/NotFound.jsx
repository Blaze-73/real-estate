import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Seo from '../../components/common/Seo';

const NotFound = () => {
  const { t } = useTranslation();
  return (
    <div className="pt-24 pb-16 bg-sand-50 dark:bg-ink-950 min-h-screen flex items-center justify-center">
      <Seo title={t('notFound.title')} noindex />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center px-6"
      >
        <p className="text-8xl md:text-9xl font-extrabold text-[#1f94af]/20">404</p>
        <h1 className="mt-4 text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{t('notFound.h1')}</h1>
        <p className="mt-3 text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          {t('notFound.copy')}
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1f94af] hover:bg-[#117490] text-white font-semibold transition-colors"
        >
          {t('notFound.backHome')}
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;

