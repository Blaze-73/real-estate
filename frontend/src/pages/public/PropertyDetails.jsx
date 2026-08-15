import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { fetchProperty, clearProperty } from '../../store/slices/propertySlice';
import contactService from '../../services/contactService';
import formatPrice from '../../utils/formatPrice';
import ImageGallery from '../../components/common/ImageGallery';
import MapComponent from '../../components/common/MapComponent';
import BookingWidget, { BookingErrorBoundary } from '../../components/public/BookingWidget';
import ReviewsSection from '../../components/public/ReviewsSection';
import PropertyCard from '../../components/common/PropertyCard';
import { TextSkeleton } from '../../components/common/LoadingSkeleton';
import Seo from '../../components/common/Seo';
import { amenityIcon, youtubeEmbedUrl } from '../../constants/amenities';

const SCHEMA_TYPES = {
  villa: 'SingleFamilyResidence',
  house: 'House',
  apartment: 'Apartment',
  studio: 'Apartment',
  commercial: 'Office',
};

const buildJsonLd = (property, url) => {
  const image = property.cover;
  const price = property.nightly_price ?? property.monthly_price ?? property.price;
  const city = property.city || 'Asilah';

  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description?.slice(0, 160) || `${property.title} in ${city}, Morocco`,
    url,
    datePosted: property.created_at ? String(property.created_at).slice(0, 10) : undefined,
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency: 'MAD',
      businessFunction: 'https://schema.org/LeaseOut',
      availability: property.status === 'available' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url,
    },
    itemOffered: {
      '@type': SCHEMA_TYPES[property.type] || 'Accommodation',
      name: property.title,
      numberOfRooms: property.bedrooms,
      numberOfBathroomsTotal: property.bathrooms,
      floorSize: property.surface ? { '@type': 'QuantitativeValue', value: property.surface, unitCode: 'MTK' } : undefined,
      image,
      address: {
        '@type': 'PostalAddress',
        streetAddress: property.address || undefined,
        addressLocality: city,
        addressCountry: 'MA',
      },
      geo: property.latitude && property.longitude
        ? { '@type': 'GeoCoordinates', latitude: Number(property.latitude), longitude: Number(property.longitude) }
        : undefined,
      containedInPlace: {
        '@type': 'Place',
        name: city,
        containedInPlace: { '@type': 'Country', name: 'Morocco' },
      },
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${window.location.origin}/` },
        { '@type': 'ListItem', position: 2, name: 'Properties', item: `${window.location.origin}/properties` },
        { '@type': 'ListItem', position: 3, name: property.title, item: url },
      ],
    },
  };
};

const PropertyDetails = () => {
  const { t } = useTranslation();
  const { slug } = useParams();
  const dispatch = useDispatch();
  const { property, loading, error, similar } = useSelector((state) => state.properties);
  const settings = useSelector((state) => state.settings.settings);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState({ sending: false, sent: false, error: '' });
  const [reveal, setReveal] = useState({ revealed: false, loading: false, error: '', phone: '', name: '', email: '', visitorPhone: '' });
  const [viewing, setViewing] = useState({ name: '', email: '', phone: '', date: '', time: '', message: '' });
  const [viewingStatus, setViewingStatus] = useState({ sending: false, sent: false, error: '' });

  useEffect(() => {
    dispatch(fetchProperty(slug));
    return () => dispatch(clearProperty());
  }, [dispatch, slug]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleViewingChange = (e) => setViewing({ ...viewing, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ sending: true, sent: false, error: '' });
    try {
      await contactService.send({
        ...form,
        subject: t('propertyDetails.inquirySubject', { title: property?.title || 'property' }),
      });
      setStatus({ sending: false, sent: true, error: '' });
      setForm({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => setStatus((s) => ({ ...s, sent: false })), 5000);
    } catch (err) {
      setStatus({ sending: false, sent: false, error: err.response?.data?.message || 'Failed to send. Please try again.' });
    }
  };

  const handleReveal = async (e) => {
    e.preventDefault();
    setReveal((r) => ({ ...r, loading: true, error: '' }));
    try {
      const data = await contactService.revealPhone(slug, {
        name: reveal.name,
        email: reveal.email,
        phone: reveal.visitorPhone,
      });
      setReveal((r) => ({ ...r, revealed: true, loading: false, phone: data.phone }));
    } catch (err) {
      setReveal((r) => ({ ...r, loading: false, error: err.response?.data?.message || t('common.error') }));
    }
  };

  const handleViewing = async (e) => {
    e.preventDefault();
    setViewingStatus({ sending: true, sent: false, error: '' });
    try {
      const when = [viewing.date, viewing.time].filter(Boolean).join(' Ã‚Â· ');
      const message = viewing.message || t('propertyDetails.viewingDefaultMessage', { when: when || t('common.asap') });
      await contactService.send({
        name: viewing.name,
        email: viewing.email,
        phone: viewing.phone,
        subject: t('propertyDetails.viewingSubject', { title: property?.title || 'property' }),
        message: `${message}\n${t('propertyDetails.preferredTimeLabel', { when: when || t('common.asap') })}`,
      });
      setViewingStatus({ sending: false, sent: true, error: '' });
      setViewing({ name: '', email: '', phone: '', date: '', time: '', message: '' });
      setTimeout(() => setViewingStatus((s) => ({ ...s, sent: false })), 5000);
    } catch (err) {
      setViewingStatus({ sending: false, sent: false, error: err.response?.data?.message || t('common.error') });
    }
  };

  if (loading) {
    return (
      <div className="pt-24 pb-16 bg-[#F8FAFC] dark:bg-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-[400px] bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse mb-8" />
          <TextSkeleton lines={6} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-24 pb-16 bg-[#F8FAFC] dark:bg-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <p className="text-red-500">{error}</p>
          <Link to="/properties" className="mt-4 inline-block text-[#38BDF8] hover:underline">{t('common.backToProperties')}</Link>
        </div>
      </div>
    );
  }

  if (!property) return null;

  const images = (property.images || [])
    .map((img) => (typeof img === 'string' ? img : img?.url))
    .filter(Boolean);
  const galleryImages = images.length > 0 ? images : [property.cover].filter(Boolean);

  const whatsapp = settings?.whatsapp_number || '212XXXXXXXXX';

  return (
    <div className="pt-24 pb-16 bg-[#F8FAFC] dark:bg-gray-900 min-h-screen">
      <Seo
        title={property.title}
        description={property.description?.slice(0, 160) || `${property.title} in ${property.location || 'Asilah, Morocco'}`}
        image={property.cover}
        jsonLd={buildJsonLd(property, `${window.location.origin}/properties/${slug}`)}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/properties" className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-[#38BDF8] mb-6 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('common.backToProperties')}
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ImageGallery images={galleryImages} />

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{property.title}</h1>
                  {property.location && (
                    <p className="flex items-center gap-1 text-gray-500 dark:text-gray-400 mt-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {property.location}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-[#38BDF8]">
                    {formatPrice(property.nightly_price ?? property.monthly_price ?? property.price, t('common.contactForPrice'))}
                    {property.nightly_price && <span className="text-sm font-medium text-gray-500 dark:text-gray-400"> {t('common.perNight')}</span>}
                    {!property.nightly_price && property.monthly_price && <span className="text-sm font-medium text-gray-500 dark:text-gray-400"> {t('common.perMonth')}</span>}
                  </p>
                  {property.type && (
                    <span className="inline-block mt-1 px-3 py-1 rounded-full bg-[#38BDF8]/10 text-[#38BDF8] text-sm">{t(`types.${property.type}`, { defaultValue: property.type })}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {[
                  { label: t('propertyDetails.bedrooms'), value: property.bedrooms || 0, icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
                  { label: t('propertyDetails.bathrooms'), value: property.bathrooms || 0, icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                  { label: t('propertyDetails.surface'), value: `${property.surface || 0} mÃ‚Â²`, icon: 'M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5' },
                  { label: t('propertyDetails.status'), value: property.status === 'available' ? t('propertyDetails.available') : property.status, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 text-center">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-[#38BDF8]/10 flex items-center justify-center">
                      <svg className="w-5 h-5 text-[#38BDF8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                      </svg>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{item.value}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
                  </div>
                ))}
              </div>

              <div className="max-w-none mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{t('propertyDetails.description')}</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{property.description || t('propertyDetails.noDescription')}</p>
              </div>

              {property.features?.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{t('propertyDetails.features')}</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {property.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {property.amenities?.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{t('propertyDetails.amenities')}</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {property.amenities.map((key) => (
                      <div key={key} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 rounded-xl bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 px-3 py-2">
                        <svg className="w-4 h-4 text-[#38BDF8] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={amenityIcon(key)} />
                        </svg>
                        {t(`amenities.${key}`, { defaultValue: key })}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {property.video_url && youtubeEmbedUrl(property.video_url) && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{t('propertyDetails.videoTour')}</h2>
                  <div className="aspect-video rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 bg-ink-950">
                    <iframe
                      src={youtubeEmbedUrl(property.video_url)}
                      title={t('propertyDetails.videoTour')}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              {property.cancellation_policy && (
                <div className="mb-8 flex items-start gap-3 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-green-700 dark:text-green-400">{property.cancellation_policy}</p>
                    <p className="text-xs text-green-600/70 dark:text-green-500/70 mt-0.5">{t('propertyDetails.flexibleCancellation')}</p>
                  </div>
                </div>
              )}

              <ReviewsSection property={property} />
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <div className="sticky top-24 space-y-6">
              {(property.nightly_price || property.monthly_price) && (
                <BookingErrorBoundary>
                  <BookingWidget property={property} slug={slug} />
                </BookingErrorBoundary>
              )}

              <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#38BDF8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h2.28a1 1 0 01.95.68l1.1 3.3a1 1 0 01-.5 1.23l-1.55.78a11.03 11.03 0 006.25 6.25l.78-1.55a1 1 0 011.23-.5l3.3 1.1a1 1 0 01.68.95V19a2 2 0 01-2 2h-1C9.72 21 3 14.28 3 6V5z" />
                  </svg>
                  {t('propertyDetails.callOwner')}
                </h3>
                {reveal.revealed ? (
                  <div className="space-y-3">
                    <p className="flex items-center justify-between gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <span dir="ltr" className="font-semibold text-gray-900 dark:text-white">{reveal.phone}</span>
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </p>
                    <a
                      href={`tel:${reveal.phone}`}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#38BDF8] hover:bg-[#0EA5E9] text-white font-semibold transition-colors text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h2.28a1 1 0 01.95.68l1.1 3.3a1 1 0 01-.5 1.23l-1.55.78a11.03 11.03 0 006.25 6.25l.78-1.55a1 1 0 011.23-.5l3.3 1.1a1 1 0 01.68.95V19a2 2 0 01-2 2h-1C9.72 21 3 14.28 3 6V5z" />
                      </svg>
                      {t('propertyDetails.callNow')}
                    </a>
                    <a
                      href={`https://wa.me/${reveal.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(t('propertyDetails.whatsappIntro', { title: property.title }))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1DA851] text-white font-semibold transition-colors text-sm"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      {t('propertyDetails.whatsapp')}
                    </a>
                  </div>
                ) : (
                  <form onSubmit={handleReveal} className="space-y-3">
                    {reveal.error && (
                      <p className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">{reveal.error}</p>
                    )}
                    <input type="text" name="name" value={reveal.name} onChange={(e) => setReveal((r) => ({ ...r, name: e.target.value }))} placeholder={t('propertyDetails.yourName')} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8]" required />
                    <input type="email" name="email" value={reveal.email} onChange={(e) => setReveal((r) => ({ ...r, email: e.target.value }))} placeholder={t('propertyDetails.yourEmail')} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8]" required />
                    <input type="tel" name="visitorPhone" value={reveal.visitorPhone} onChange={(e) => setReveal((r) => ({ ...r, visitorPhone: e.target.value }))} placeholder={t('propertyDetails.phoneNumber')} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8]" />
                    <p className="text-xs text-gray-400 dark:text-gray-500">{t('propertyDetails.revealNotice')}</p>
                    <button type="submit" disabled={reveal.loading} className="w-full py-2.5 rounded-xl bg-[#38BDF8] hover:bg-[#0EA5E9] text-white font-semibold transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                      {reveal.loading ? t('common.sending') : t('propertyDetails.showNumber')}
                    </button>
                  </form>
                )}
              </div>

              <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#38BDF8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {t('propertyDetails.scheduleViewing')}
                </h3>
                <form onSubmit={handleViewing} className="space-y-3">
                  {viewingStatus.sent && (
                    <p className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-sm">
                      {t('common.messageSent')}
                    </p>
                  )}
                  {viewingStatus.error && (
                    <p className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                      {viewingStatus.error}
                    </p>
                  )}
                  <input type="text" name="name" value={viewing.name} onChange={handleViewingChange} placeholder={t('propertyDetails.yourName')} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8]" required />
                  <input type="email" name="email" value={viewing.email} onChange={handleViewingChange} placeholder={t('propertyDetails.yourEmail')} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8]" required />
                  <input type="tel" name="phone" value={viewing.phone} onChange={handleViewingChange} placeholder={t('propertyDetails.phoneNumber')} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8]" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="date" name="date" value={viewing.date} onChange={handleViewingChange} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8]" />
                    <input type="time" name="time" value={viewing.time} onChange={handleViewingChange} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8]" />
                  </div>
                  <textarea name="message" value={viewing.message} onChange={handleViewingChange} placeholder={t('propertyDetails.viewingMessagePlaceholder')} rows={2} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8] resize-none" />
                  <button type="submit" disabled={viewingStatus.sending} className="w-full py-2.5 rounded-xl bg-[#38BDF8] hover:bg-[#0EA5E9] text-white font-semibold transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                    {viewingStatus.sending ? t('common.sending') : t('propertyDetails.requestViewing')}
                  </button>
                </form>
              </div>

              <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{property.nightly_price || property.monthly_price ? t('propertyDetails.questions') : t('propertyDetails.contactOwner')}</h3>
                <form onSubmit={handleSubmit} className="space-y-3">
                  {status.sent && (
                    <p className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-sm">
                      {t('common.messageSent')}
                    </p>
                  )}
                  {status.error && (
                    <p className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                      {status.error}
                    </p>
                  )}
                  <input type="text" name="name" value={form.name} onChange={handleChange} placeholder={t('propertyDetails.yourName')} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8]" required />
                  <input type="email" name="email" value={form.email} onChange={handleChange} placeholder={t('propertyDetails.yourEmail')} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8]" required />
                  <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder={t('propertyDetails.phoneNumber')} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8]" />
                  <textarea name="message" value={form.message} onChange={handleChange} placeholder={t('propertyDetails.yourMessage')} rows={4} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8] resize-none" required />
                  <button type="submit" disabled={status.sending} className="w-full py-2.5 rounded-xl bg-[#38BDF8] hover:bg-[#0EA5E9] text-white font-semibold transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                    {status.sending ? t('common.sending') : t('common.sendMessage')}
                  </button>
                </form>
              </div>

              <a
                href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(t('propertyDetails.whatsappIntro', { title: property.title }))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#25D366] hover:bg-[#1DA851] text-white font-semibold transition-colors text-sm"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                {t('propertyDetails.whatsapp')}
              </a>

              <MapComponent
                location={property.location || 'Asilah, Morocco'}
                latitude={property.latitude}
                longitude={property.longitude}
              />
            </div>
          </motion.div>
        </div>

        {similar?.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-16"
            aria-label={t('propertyDetails.similarAria')}
          >
            <div className="flex items-end justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{t('propertyDetails.similarTitle')}</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">{t('propertyDetails.similarSubtitle', { city: property.city || 'Asilah' })}</p>
              </div>
              <Link to="/properties" className="inline-flex items-center gap-1 text-sm font-semibold text-[#38BDF8] hover:text-[#0EA5E9] transition-colors shrink-0">
                {t('common.viewAll')}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((item) => (
                <PropertyCard key={item.id ?? item.slug} property={item} />
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
};

export default PropertyDetails;

