import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import contactService from '../../services/contactService';
import Seo from '../../components/common/Seo';

const TYPE_OPTIONS = ['house', 'villa', 'apartment', 'studio', 'commercial', 'seasonal', 'long_term'];
const NEIGHBORHOODS = ['rmel', 'medina', 'kasbah', 'heights', 'avenue', 'artistic', 'beachfront', 'other'];

const WHY = [
  { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', t: 'why1Title', d: 'why1Text' },
  { icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', t: 'why2Title', d: 'why2Text' },
  { icon: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z', t: 'why3Title', d: 'why3Text' },
  { icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z', t: 'why4Title', d: 'why4Text' },
];

const STEPS = [
  { icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', t: 'step1Title', d: 'step1Text' },
  { icon: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z', t: 'step2Title', d: 'step2Text' },
  { icon: 'M13 10V3L4 14h7v7l9-11h-7z', t: 'step3Title', d: 'step3Text' },
];

const Sell = () => {
  const { t } = useTranslation();
  const settings = useSelector((state) => state.settings.settings) || {};
  const [form, setForm] = useState({
    name: '', phone: '', email: '', purpose: 'sale', property_type: '', neighborhood: '', message: '',
  });
  const [status, setStatus] = useState({ sending: false, sent: false, error: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ sending: true, sent: false, error: '' });
    try {
      await contactService.sendSell(form);
      setStatus({ sending: false, sent: true, error: '' });
    } catch (err) {
      setStatus({ sending: false, sent: false, error: err.response?.data?.message || t('common.failedToSend') });
    }
  };

  const resetForm = () => {
    setForm({ name: '', phone: '', email: '', purpose: 'sale', property_type: '', neighborhood: '', message: '' });
    setStatus({ sending: false, sent: false, error: '' });
  };

  const fieldCls = 'w-full px-4 py-3 rounded-xl bg-white dark:bg-ink-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#9aa0a6] text-sm';
  const labelCls = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5';

  return (
    <div className="pt-24 pb-16 bg-sand-50 dark:bg-ink-950 min-h-screen">
      <Seo
        title={t('sell.title')}
        description={t('sell.description')}
        canonical="/sell"
      />

      <section className="relative py-20 md:py-28 bg-gradient-to-br from-ink-950 via-ink-900 to-ink-950 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80"
            alt=""
            className="h-full w-full object-cover opacity-25"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink-950/70 via-ink-950/60 to-ink-950" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-4xl md:text-5xl font-bold text-white mb-5 max-w-3xl mx-auto">
            {t('sell.h1')}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-gray-300 text-lg max-w-2xl mx-auto">
            {t('sell.subtitle')}
          </motion.p>
          <motion.a
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            href="#sell-form"
            className="inline-flex items-center gap-2 mt-8 rounded-xl bg-[#ececf0] px-6 py-3.5 text-sm font-semibold text-ink-950 transition-colors hover:bg-white"
          >
            {t('sell.submit')}
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.a>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[#63686f] dark:text-[#d9d9de] font-semibold text-sm uppercase tracking-wider">{t('sell.whyTitle')}</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-2">{t('sell.whyTitle')}</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY.map((item, idx) => (
              <motion.div
                key={item.t}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="p-6 rounded-2xl bg-white dark:bg-ink-900 border border-gray-100 dark:border-white/5 shadow-sm"
              >
                <div className="w-11 h-11 rounded-xl bg-[#ececf0]/60 dark:bg-[#ececf0]/10 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-[#63686f] dark:text-[#d9d9de]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">{t(`sell.${item.t}`)}</h3>
                <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">{t(`sell.${item.d}`)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-ink-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[#63686f] dark:text-[#d9d9de] font-semibold text-sm uppercase tracking-wider">{t('sell.howTitle')}</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-2">{t('sell.howTitle')}</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step, idx) => (
              <motion.div
                key={step.t}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="relative flex items-start gap-5 md:block md:text-center"
              >
                <div className="relative flex-shrink-0">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-ink-950 text-white md:mx-auto">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                      <path d={step.icon} />
                    </svg>
                  </div>
                  <span className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-ocean-400 text-xs font-bold text-ink-950">
                    {idx + 1}
                  </span>
                </div>
                <div className="md:mt-5">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t(`sell.${step.t}`)}</h3>
                  <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">{t(`sell.${step.d}`)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="sell-form" className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="lg:col-span-3">
              <span className="text-[#63686f] dark:text-[#d9d9de] font-semibold text-sm uppercase tracking-wider">{t('sell.formTitle')}</span>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-2 mb-2">{t('sell.formTitle')}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">{t('sell.formSubtitle')}</p>

              {status.sent ? (
                <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-8 text-center">
                  <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-green-500/15">
                    <svg className="h-7 w-7 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('sell.successTitle')}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">{t('sell.successText')}</p>
                  <button type="button" onClick={resetForm} className="rounded-xl border border-gray-300 dark:border-gray-600 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                    {t('sell.sendAnother')}
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {status.error && (
                    <p className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                      {status.error}
                    </p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="sell-name" className={labelCls}>{t('sell.yourName')}</label>
                      <input id="sell-name" type="text" name="name" value={form.name} onChange={handleChange} className={fieldCls} required />
                    </div>
                    <div>
                      <label htmlFor="sell-phone" className={labelCls}>{t('sell.yourPhone')}</label>
                      <input id="sell-phone" type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+212 6 XX XX XX XX" className={fieldCls} required />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="sell-email" className={labelCls}>{t('sell.yourEmail')}</label>
                    <input id="sell-email" type="email" name="email" value={form.email} onChange={handleChange} className={fieldCls} required />
                  </div>

                  <div>
                    <span className={labelCls}>{t('sell.purpose')}</span>
                    <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label={t('sell.purpose')}>
                      {(['sale', 'rent']).map((val) => (
                        <label
                          key={val}
                          className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                            form.purpose === val
                              ? 'border-[#9aa0a6] bg-[#ececf0]/40 dark:bg-[#ececf0]/10 text-gray-900 dark:text-white'
                              : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-[#9aa0a6]/50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="purpose"
                            value={val}
                            checked={form.purpose === val}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          {t(`sell.purpose${val === 'sale' ? 'Sale' : 'Rent'}`)}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="sell-type" className={labelCls}>{t('sell.propertyType')}</label>
                      <select id="sell-type" name="property_type" value={form.property_type} onChange={handleChange} className={fieldCls} required>
                        <option value="" disabled>{t('sell.propertyTypePlaceholder')}</option>
                        {TYPE_OPTIONS.map((type) => (
                          <option key={type} value={type}>{t(`types.${type}`, { defaultValue: type })}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="sell-neighborhood" className={labelCls}>{t('sell.neighborhood')}</label>
                      <select id="sell-neighborhood" name="neighborhood" value={form.neighborhood} onChange={handleChange} className={fieldCls} required>
                        <option value="" disabled>{t('sell.neighborhoodPlaceholder')}</option>
                        {NEIGHBORHOODS.map((n) => (
                          <option key={n} value={t(`sell.neighborhood${n.charAt(0).toUpperCase()}${n.slice(1)}`)}>{t(`sell.neighborhood${n.charAt(0).toUpperCase()}${n.slice(1)}`)}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="sell-message" className={labelCls}>{t('sell.message')}</label>
                    <textarea id="sell-message" name="message" value={form.message} onChange={handleChange} placeholder={t('sell.messagePlaceholder')} rows={4} className={`${fieldCls} resize-none`} />
                  </div>

                  <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit" disabled={status.sending} className="w-full py-3.5 rounded-xl bg-[#ececf0] hover:bg-white text-ink-950 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {status.sending ? t('sell.sending') : t('sell.submit')}
                  </motion.button>
                </form>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="lg:col-span-2 space-y-6">
              <div className="p-6 rounded-2xl bg-ink-950 text-white">
                <h3 className="text-lg font-semibold mb-4">{t('sell.contactTitle')}</h3>
                <p className="text-sm text-gray-300 mb-6">{t('sell.contactText')}</p>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-3">
                    <svg className="h-5 w-5 text-ocean-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{settings.company_phone || '+212 5XX XX XX XX'}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg className="h-5 w-5 text-ocean-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>{settings.company_email || 'contact@asilahrealestate.com'}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg className="h-5 w-5 text-ocean-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{settings.company_address || 'Asilah, Morocco'}</span>
                  </li>
                </ul>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-ink-900 border border-gray-100 dark:border-white/5">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('sell.neighborhoodsTitle')}</h3>
                <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">{t('sell.neighborhoodsText')}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Sell;