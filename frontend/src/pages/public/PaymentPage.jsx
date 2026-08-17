import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import paymentService from '../../services/paymentService';
import formatPrice from '../../utils/formatPrice';
import Seo from '../../components/common/Seo';
import { TextSkeleton } from '../../components/common/LoadingSkeleton';

const CardInput = ({ label, value, onChange, placeholder, type = 'text', maxLength, inputMode }) => (
  <div>
    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
      inputMode={inputMode}
      autoComplete="off"
      className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#9aa0a6]"
    />
  </div>
);

const PaymentPage = () => {
  const { token } = useParams();
  const { t } = useTranslation();
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [invalid, setInvalid] = useState(false);
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '' });
  const [state, setState] = useState({ processing: false, paid: false, error: '' });

  useEffect(() => {
    let active = true;
    paymentService
      .preview(token)
      .then((data) => {
        if (!active) return;
        setPreview(data);
        setState((s) => ({ ...s, paid: data.payment?.status === 'paid' }));
      })
      .catch(() => active && setInvalid(true))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [token]);

  const handlePay = async (e) => {
    e.preventDefault();
    setState({ processing: true, paid: false, error: '' });
    try {
      const result = await paymentService.callback({
        token,
        card_number: card.number,
        card_expiry: card.expiry,
        card_cvv: card.cvv,
      });
      setState({ processing: false, paid: true, error: '' });
      setPreview((p) => ({ ...p, payment: result.payment }));
    } catch (err) {
      setState({ processing: false, paid: false, error: err.response?.data?.message || t('payment.declined') });
    }
  };

  if (loading) {
    return (
      <div className="pt-24 pb-16 bg-sand-50 dark:bg-ink-950 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <TextSkeleton />
          <TextSkeleton />
        </div>
      </div>
    );
  }

  if (invalid || !preview) {
    return (
      <div className="pt-24 pb-16 bg-sand-50 dark:bg-ink-950 min-h-screen">
        <div className="max-w-md mx-auto px-4 text-center mt-16">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t('payment.invalidLink')}</h1>
          <Link to="/" className="inline-block mt-2 text-sm font-semibold text-[#63686f] dark:text-[#d9d9de] hover:underline">{t('common.backHome')}</Link>
        </div>
      </div>
    );
  }

  const amount = Number(preview.payment?.amount ?? 0);

  return (
    <div className="pt-24 pb-16 bg-sand-50 dark:bg-ink-950 min-h-screen">
      <Seo title={t('payment.title')} description={t('payment.description')} noindex />
      <section className="relative py-14 bg-gradient-to-r from-ink-950 to-ink-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, #d9d9de 0%, transparent 50%)' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-4xl font-bold text-white mb-3">{t('payment.title')}</motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-gray-400">{t('payment.depositFor')}</motion.p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-ink-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="p-6 space-y-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">{t('payment.property')}</span>
                <Link to={`/properties/${preview.property_slug}`} className="text-sm font-semibold text-gray-900 dark:text-white hover:text-[#63686f] dark:text-[#d9d9de] transition-colors text-right">
                  {preview.property_title}
                </Link>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">{t('payment.bookingReference')}</span>
                <span className="text-sm font-mono font-semibold text-gray-900 dark:text-white">{preview.booking_reference}</span>
              </div>
              {preview.check_in && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{t('payment.dates')}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(preview.check_in).toLocaleDateString()} → {new Date(preview.check_out).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between pt-2">
                <span className="text-base font-semibold text-gray-900 dark:text-white">{t('payment.amountToPay')}</span>
                <span className="text-2xl font-bold text-[#63686f] dark:text-[#d9d9de]">{formatPrice(amount, '')}</span>
              </div>
            </div>

            {state.paid ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('payment.success')}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('payment.successDetails')}</p>
                {preview.property_slug && (
                  <Link to={`/properties/${preview.property_slug}`} className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-[#ececf0] hover:bg-white text-ink-950 font-semibold transition-colors text-sm">
                    {t('payment.viewProperty')}
                  </Link>
                )}
              </div>
            ) : (
              <form onSubmit={handlePay} className="p-6 space-y-4">
                <p className="text-xs p-3 rounded-xl bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300">
                  {t('payment.sandboxNotice')}
                </p>

                {state.error && (
                  <p className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">{state.error}</p>
                )}

                <CardInput
                  label={t('payment.cardNumber')}
                  value={card.number}
                  onChange={(e) => setCard({ ...card, number: e.target.value.replace(/[^\d]/g, '') })}
                  placeholder="4242 4242 4242 4242"
                  maxLength={16}
                  inputMode="numeric"
                />
                <div className="grid grid-cols-2 gap-3">
                  <CardInput
                    label={t('payment.expiry')}
                    value={card.expiry}
                    onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                  <CardInput
                    label={t('payment.cvv')}
                    value={card.cvv}
                    onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/[^\d]/g, '') })}
                    placeholder="123"
                    maxLength={3}
                    inputMode="numeric"
                  />
                </div>

                <button
                  type="submit"
                  disabled={state.processing || card.number.length < 12 || card.expiry.length < 4 || card.cvv.length < 3}
                  className="w-full py-3 rounded-xl bg-[#ececf0] hover:bg-white text-ink-950 font-semibold transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {state.processing ? t('payment.processing') : t('payment.payNow', { amount: formatPrice(amount, '') })}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default PaymentPage;
