import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchProperty, clearProperty } from '../../store/slices/propertySlice';
import contactService from '../../services/contactService';
import ImageGallery from '../../components/common/ImageGallery';
import MapComponent from '../../components/common/MapComponent';
import { TextSkeleton } from '../../components/common/LoadingSkeleton';

const PropertyDetails = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const { property, loading, error } = useSelector((state) => state.properties);
  const settings = useSelector((state) => state.settings.settings);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState({ sending: false, sent: false, error: '' });

  useEffect(() => {
    dispatch(fetchProperty(slug));
    return () => dispatch(clearProperty());
  }, [dispatch, slug]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ sending: true, sent: false, error: '' });
    try {
      await contactService.send({
        ...form,
        subject: `Inquiry about ${property?.title || 'property'}`,
      });
      setStatus({ sending: false, sent: true, error: '' });
      setForm({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => setStatus((s) => ({ ...s, sent: false })), 5000);
    } catch (err) {
      setStatus({ sending: false, sent: false, error: err.response?.data?.message || 'Failed to send. Please try again.' });
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
          <Link to="/properties" className="mt-4 inline-block text-[#38BDF8] hover:underline">Back to Properties</Link>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/properties" className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-[#38BDF8] mb-6 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Properties
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
                    {property.price ? `${property.price.toLocaleString()} MAD` : 'Contact for Price'}
                  </p>
                  {property.type && (
                    <span className="inline-block mt-1 px-3 py-1 rounded-full bg-[#38BDF8]/10 text-[#38BDF8] text-sm">{property.type}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Bedrooms', value: property.bedrooms || 0, icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
                  { label: 'Bathrooms', value: property.bathrooms || 0, icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                  { label: 'Surface', value: `${property.surface || 0} m²`, icon: 'M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5' },
                  { label: 'Status', value: property.status || 'Available', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
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
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Description</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{property.description || 'No description available.'}</p>
              </div>

              {property.features?.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Features</h2>
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
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <div className="sticky top-24 space-y-6">
              <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Contact Owner</h3>
                <form onSubmit={handleSubmit} className="space-y-3">
                  {status.sent && (
                    <p className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-sm">
                      Message sent successfully!
                    </p>
                  )}
                  {status.error && (
                    <p className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                      {status.error}
                    </p>
                  )}
                  <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Your Name" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8]" required />
                  <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Your Email" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8]" required />
                  <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="Phone Number" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8]" />
                  <textarea name="message" value={form.message} onChange={handleChange} placeholder="Your Message" rows={4} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8] resize-none" required />
                  <button type="submit" disabled={status.sending} className="w-full py-2.5 rounded-xl bg-[#38BDF8] hover:bg-[#0EA5E9] text-white font-semibold transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                    {status.sending ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </div>

              <a
                href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Hi, I'm interested in ${property.title}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#25D366] hover:bg-[#1DA851] text-white font-semibold transition-colors text-sm"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
              </a>

              <MapComponent location={property.location || 'Asilah, Morocco'} />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
