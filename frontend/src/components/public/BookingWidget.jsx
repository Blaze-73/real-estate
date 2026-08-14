import { Component, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import propertyService from '../../services/propertyService';
import paymentService from '../../services/paymentService';
import MonthCalendar from '../common/MonthCalendar';
import formatPrice from '../../utils/formatPrice';

const today = () => new Date().toISOString().split('T')[0];

const monthKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

class BookingErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

const BookingWidget = ({ property, slug }) => {
  const { t, i18n } = useTranslation();
  const [dates, setDates] = useState({ check_in: '', check_out: '' });
  const [guests, setGuests] = useState(1);
  const [quote, setQuote] = useState(null);
  const [quoteState, setQuoteState] = useState({ loading: false, error: '' });
  const [booking, setBooking] = useState({ name: '', email: '', phone: '' });
  const [bookingState, setBookingState] = useState({ sending: false, done: false, error: '', reference: '' });
  const [payState, setPayState] = useState({ loading: false, error: '' });
  const [calMonth, setCalMonth] = useState(() => new Date());
  const [calendar, setCalendar] = useState({});
  const [calLoading, setCalLoading] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      setCalLoading(true);
      try {
        const data = await propertyService.calendar(slug, monthKey(calMonth));
        if (active) setCalendar(data.days || {});
      } catch {
        if (active) setCalendar({});
      } finally {
        if (active) setCalLoading(false);
      }
    }
    load();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, monthKey(calMonth)]);

  const handleSelectDay = (dateStr) => {
    setQuote(null);
    setDates((prev) => {
      if (!prev.check_in || (prev.check_in && prev.check_out)) {
        return { check_in: dateStr, check_out: '' };
      }
      if (dateStr > prev.check_in) {
        return { ...prev, check_out: dateStr };
      }
      return { check_in: dateStr, check_out: '' };
    });
  };

  const shiftMonth = (dir) => {
    setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() + dir, 1));
  };

  const rateLabel = quote?.rate_type === 'month'
    ? `${formatPrice(quote?.rate, '')}${t('common.perMonth')}`
    : `${formatPrice(quote?.rate, '')}${t('common.perNight')}`;

  const handleQuote = async (e) => {
    e.preventDefault();
    if (!dates.check_in || !dates.check_out) {
      setQuoteState({ loading: false, error: t('booking.selectDatesError') });
      return;
    }
    setQuoteState({ loading: true, error: '' });
    setBookingState((s) => ({ ...s, done: false, reference: '', error: '' }));
    try {
      const result = await propertyService.quote(slug, dates);
      setQuote(result);
    } catch (err) {
      setQuoteState({ loading: false, error: err.response?.data?.message || t('booking.couldNotCheck') });
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!quote?.available) return;
    setBookingState({ sending: true, error: '', done: false });
    try {
      const result = await propertyService.book(slug, {
        ...dates,
        guests,
        guest_name: booking.name,
        guest_email: booking.email,
        guest_phone: booking.phone,
      });
      setBookingState({ sending: false, done: true, reference: result.booking_reference, error: '' });
    } catch (err) {
      setBookingState({ sending: false, done: false, reference: '', error: err.response?.data?.message || t('booking.bookingFailed') });
    }
  };

  const handlePayDeposit = async () => {
    setPayState({ loading: true, error: '' });
    try {
      const checkout = await paymentService.checkout(bookingState.reference);
      window.location.href = checkout.checkout_url;
    } catch (err) {
      setPayState({ loading: false, error: err.response?.data?.message || t('booking.payFailed') });
    }
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8]";
  const labelCls = "block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1";

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
      <div className="flex items-baseline justify-between mb-4">
        <p className="text-3xl font-bold text-[#38BDF8]">
          {formatPrice(quote?.rate ?? property.nightly_price ?? property.monthly_price ?? property.price, t('common.contactForPrice'))}
        </p>
        {(property.nightly_price || property.monthly_price) && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {quote ? rateLabel : property.nightly_price ? t('common.perNight') : t('common.perMonth')}
          </span>
        )}
      </div>

      <form onSubmit={handleQuote} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>{t('booking.checkIn')}</label>
            <input type="date" min={today()} value={dates.check_in} onChange={(e) => setDates({ ...dates, check_in: e.target.value })} className={inputCls} required />
          </div>
          <div>
            <label className={labelCls}>{t('booking.checkOut')}</label>
            <input type="date" min={dates.check_in || today()} value={dates.check_out} onChange={(e) => setDates({ ...dates, check_out: e.target.value })} className={inputCls} required />
          </div>
        </div>

        <div>
          <label className={labelCls}>{t('booking.guests')}</label>
          <input type="number" min="1" max="20" value={guests} onChange={(e) => setGuests(Number(e.target.value) || 1)} className={inputCls} />
        </div>

        <div className="pt-1">
          <div className="flex items-center justify-between mb-2">
            <p className={labelCls}>{t('booking.availabilityCalendar')}</p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => shiftMonth(-1)} className="w-6 h-6 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm leading-none">‹</button>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300 min-w-[110px] text-center">
                {calMonth.toLocaleString(i18n.language || 'en', { month: 'long', year: 'numeric' })}
              </span>
              <button type="button" onClick={() => shiftMonth(1)} className="w-6 h-6 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm leading-none">›</button>
            </div>
          </div>
          {calLoading ? (
            <p className="text-sm text-gray-400 py-6 text-center">{t('booking.loadingAvailability')}</p>
          ) : (
            <MonthCalendar
              month={calMonth}
              dayStatus={calendar}
              selected={[dates.check_in, dates.check_out].filter(Boolean)}
              onSelect={handleSelectDay}
              disablePast
            />
          )}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[11px] text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-sky-500/15 border border-sky-300 dark:border-sky-700" />{t('booking.booked')}</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700" />{t('booking.blocked')}</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700" />{t('booking.selectable')}</span>
          </div>
        </div>

        {quoteState.error && (
          <p className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">{quoteState.error}</p>
        )}

        <button type="submit" disabled={quoteState.loading} className="w-full py-2.5 rounded-xl bg-[#38BDF8] hover:bg-[#0EA5E9] text-white font-semibold transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed">
          {quoteState.loading ? t('booking.checking') : t('booking.checkAvailability')}
        </button>
      </form>

      {quote && (
        <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-800 space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
            <span>{formatPrice(quote.rate, '')} x {quote.nights} {quote.rate_type === 'month' ? t('booking.month') : t('booking.nights')}</span>
            <span>{formatPrice(quote.subtotal, '')}</span>
          </div>
          {quote.cleaning_fee > 0 && (
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
              <span>{t('booking.cleaningFee')}</span>
              <span>{formatPrice(quote.cleaning_fee, '')}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-base font-semibold text-gray-900 dark:text-white pt-1">
            <span>{t('booking.total')}</span>
            <span>{formatPrice(quote.total, '')}</span>
          </div>
          {quote.deposit > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('booking.depositRequired', { amount: formatPrice(quote.deposit, '') })}</p>
          )}

          <div className={`p-3 rounded-xl text-sm ${quote.available ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'}`}>
            {quote.available
              ? t('booking.availableMsg', { min: quote.min_nights })
              : t('booking.notAvailableMsg')}
          </div>

          {quote.available && (
            <form onSubmit={handleBooking} className="pt-3 space-y-3">
              {bookingState.done && (
                <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-sm space-y-1">
                  <p className="font-semibold">{t('booking.bookingReceived')}</p>
                  <p>{t('booking.yourReference', { reference: bookingState.reference })}</p>
                  <p className="text-xs">{t('booking.confirmSoon')}</p>
                </div>
              )}
              {bookingState.done && quote.deposit > 0 && (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handlePayDeposit}
                    disabled={payState.loading}
                    className="w-full py-2.5 rounded-xl bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-semibold transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {payState.loading ? t('booking.payRedirecting') : t('booking.payDeposit', { amount: formatPrice(quote.deposit, '') })}
                  </button>
                  {payState.error && (
                    <p className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs">{payState.error}</p>
                  )}
                </div>
              )}
              {bookingState.error && (
                <p className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">{bookingState.error}</p>
              )}
              {!bookingState.done && (
                <>
                  <input type="text" value={booking.name} onChange={(e) => setBooking({ ...booking, name: e.target.value })} placeholder={t('booking.fullName')} className={inputCls} required />
                  <input type="email" value={booking.email} onChange={(e) => setBooking({ ...booking, email: e.target.value })} placeholder={t('booking.emailAddress')} className={inputCls} required />
                  <input type="tel" value={booking.phone} onChange={(e) => setBooking({ ...booking, phone: e.target.value })} placeholder={t('propertyDetails.phoneNumber')} className={inputCls} />
                  <button type="submit" disabled={bookingState.sending} className="w-full py-2.5 rounded-xl bg-[#38BDF8] hover:bg-[#0EA5E9] text-white font-semibold transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                    {bookingState.sending ? t('booking.submitting') : t('booking.requestBooking')}
                  </button>
                </>
              )}
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingWidget;

export { BookingErrorBoundary };