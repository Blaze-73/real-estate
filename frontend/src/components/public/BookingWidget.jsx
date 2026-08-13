import { Component, useState } from 'react';
import propertyService from '../../services/propertyService';
import formatPrice from '../../utils/formatPrice';

const today = () => new Date().toISOString().split('T')[0];

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
  const [dates, setDates] = useState({ check_in: '', check_out: '' });
  const [guests, setGuests] = useState(1);
  const [quote, setQuote] = useState(null);
  const [quoteState, setQuoteState] = useState({ loading: false, error: '' });
  const [booking, setBooking] = useState({ name: '', email: '', phone: '' });
  const [bookingState, setBookingState] = useState({ sending: false, done: false, error: '', reference: '' });

  const rateLabel = quote?.rate_type === 'month'
    ? `${formatPrice(quote?.rate, '')}/month`
    : `${formatPrice(quote?.rate, '')}/night`;

  const handleQuote = async (e) => {
    e.preventDefault();
    if (!dates.check_in || !dates.check_out) {
      setQuoteState({ loading: false, error: 'Please select check-in and check-out dates.' });
      return;
    }
    setQuoteState({ loading: true, error: '' });
    setBookingState((s) => ({ ...s, done: false, reference: '', error: '' }));
    try {
      const result = await propertyService.quote(slug, dates);
      setQuote(result);
    } catch (err) {
      setQuoteState({ loading: false, error: err.response?.data?.message || 'Could not check availability.' });
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
      setBookingState({ sending: false, done: false, reference: '', error: err.response?.data?.message || 'Booking failed. Please try again.' });
    }
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8]";
  const labelCls = "block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1";

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
      <div className="flex items-baseline justify-between mb-4">
        <p className="text-3xl font-bold text-[#38BDF8]">
          {formatPrice(quote?.rate ?? property.nightly_price ?? property.monthly_price ?? property.price, 'Contact for Price')}
        </p>
        {(property.nightly_price || property.monthly_price) && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {quote ? rateLabel : property.nightly_price ? '/night' : '/month'}
          </span>
        )}
      </div>

      <form onSubmit={handleQuote} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Check-in</label>
            <input type="date" min={today()} value={dates.check_in} onChange={(e) => setDates({ ...dates, check_in: e.target.value })} className={inputCls} required />
          </div>
          <div>
            <label className={labelCls}>Check-out</label>
            <input type="date" min={dates.check_in || today()} value={dates.check_out} onChange={(e) => setDates({ ...dates, check_out: e.target.value })} className={inputCls} required />
          </div>
        </div>

        <div>
          <label className={labelCls}>Guests</label>
          <input type="number" min="1" max="20" value={guests} onChange={(e) => setGuests(Number(e.target.value) || 1)} className={inputCls} />
        </div>

        {quoteState.error && (
          <p className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">{quoteState.error}</p>
        )}

        <button type="submit" disabled={quoteState.loading} className="w-full py-2.5 rounded-xl bg-[#38BDF8] hover:bg-[#0EA5E9] text-white font-semibold transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed">
          {quoteState.loading ? 'Checking...' : 'Check Availability'}
        </button>
      </form>

      {quote && (
        <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-800 space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
            <span>{formatPrice(quote.rate, '')} x {quote.nights} {quote.rate_type === 'month' ? 'month' : 'nights'}</span>
            <span>{formatPrice(quote.subtotal, '')}</span>
          </div>
          {quote.cleaning_fee > 0 && (
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
              <span>Cleaning fee</span>
              <span>{formatPrice(quote.cleaning_fee, '')}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-base font-semibold text-gray-900 dark:text-white pt-1">
            <span>Total</span>
            <span>{formatPrice(quote.total, '')}</span>
          </div>
          {quote.deposit > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400">A deposit of {formatPrice(quote.deposit, '')} is required to confirm.</p>
          )}

          <div className={`p-3 rounded-xl text-sm ${quote.available ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'}`}>
            {quote.available
              ? `Available for these dates. Min stay: ${quote.min_nights} night(s).`
              : 'Not available for these dates. Please try different dates.'}
          </div>

          {quote.available && (
            <form onSubmit={handleBooking} className="pt-3 space-y-3">
              {bookingState.done && (
                <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-sm space-y-1">
                  <p className="font-semibold">Booking request received!</p>
                  <p>Your reference: <span className="font-mono font-bold">{bookingState.reference}</span></p>
                  <p className="text-xs">Our team will confirm your stay shortly.</p>
                </div>
              )}
              {bookingState.error && (
                <p className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">{bookingState.error}</p>
              )}
              {!bookingState.done && (
                <>
                  <input type="text" value={booking.name} onChange={(e) => setBooking({ ...booking, name: e.target.value })} placeholder="Full Name" className={inputCls} required />
                  <input type="email" value={booking.email} onChange={(e) => setBooking({ ...booking, email: e.target.value })} placeholder="Email Address" className={inputCls} required />
                  <input type="tel" value={booking.phone} onChange={(e) => setBooking({ ...booking, phone: e.target.value })} placeholder="Phone Number" className={inputCls} />
                  <button type="submit" disabled={bookingState.sending} className="w-full py-2.5 rounded-xl bg-[#38BDF8] hover:bg-[#0EA5E9] text-white font-semibold transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                    {bookingState.sending ? 'Submitting...' : 'Request Booking'}
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