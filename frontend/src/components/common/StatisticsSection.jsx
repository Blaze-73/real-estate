import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import AnimatedCounter from './AnimatedCounter';

const StatisticsSection = () => {
  const { t } = useTranslation();
  const stats = [
    { end: 150, suffix: '+', label: t('stats.labelProperties') },
    { end: 500, suffix: '+', label: t('stats.labelClients') },
    { end: 10, suffix: '+', label: t('stats.labelYears') },
    { end: 98, suffix: '%', label: t('stats.labelSatisfaction') },
  ];

  return (
    <section className="bg-sand-100 py-16 lg:py-20 dark:bg-ink-900">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12"
        >
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-ocean-600 dark:text-ocean-300">
            {t('stats.eyebrow')}
          </p>
          <p className="max-w-md font-display text-2xl font-medium leading-snug tracking-tight text-ink-900 sm:text-3xl dark:text-sand-50">
            {t('stats.heading1')} <span className="italic text-terra-500 dark:text-terra-300">{t('stats.heading2')}</span>
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-y-12 md:grid-cols-4 md:gap-y-0 md:divide-x md:divide-ink-200 lg:justify-between dark:md:divide-ink-800">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ delay: idx * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="md:px-8 lg:px-12"
            >
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-400 dark:text-ink-300">
                {stat.label}
              </p>
              <div className="mt-2">
                <AnimatedCounter end={stat.end} suffix={stat.suffix} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatisticsSection;