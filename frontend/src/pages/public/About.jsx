import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Seo from '../../components/common/Seo';

const About = () => {
  const { t } = useTranslation();
  const settings = useSelector((state) => state.settings.settings) || {};

  return (
    <div className="pt-24 pb-16 bg-sand-50 dark:bg-ink-950">
      <Seo
        title={t('about.title')}
        description={t('about.description')}
        canonical="/about"
      />
      <section className="relative py-20 bg-gradient-to-r from-ink-950 to-ink-900 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t('about.h1')}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-gray-400 text-lg max-w-2xl mx-auto">
            {t('about.subtitle')}
          </motion.p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="text-[#1f94af] font-semibold text-sm uppercase tracking-wider">{t('about.ourStory')}</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-2 mb-6">{t('about.decadeTitle')}</h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-300 leading-relaxed text-left sm:text-center">
                <p>{settings.about_us || t('about.p1')}</p>
                <p>{t('about.p2')}</p>
                <p>{t('about.p3')}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-ink-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-[#1f94af]/5 to-transparent border border-[#1f94af]/10">
              <div className="w-12 h-12 rounded-xl bg-[#1f94af]/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#1f94af]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{t('about.ourMission')}</h3>
              <p className="text-gray-500 dark:text-gray-400">{settings.mission || t('about.mission')}</p>
            </div>
            <div className="p-8 rounded-2xl bg-gradient-to-br from-[#F59E0B]/5 to-transparent border border-[#F59E0B]/10">
              <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{t('about.ourVision')}</h3>
              <p className="text-gray-500 dark:text-gray-400">{settings.vision || t('about.vision')}</p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;

