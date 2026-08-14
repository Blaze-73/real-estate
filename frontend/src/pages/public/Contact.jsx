import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import contactService from '../../services/contactService';
import MapComponent from '../../components/common/MapComponent';
import Seo from '../../components/common/Seo';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [status, setStatus] = useState({ sending: false, sent: false, error: '' });
  const settings = useSelector((state) => state.settings.settings) || {};

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ sending: true, sent: false, error: '' });
    try {
      await contactService.send(form);
      setStatus({ sending: false, sent: true, error: '' });
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => setStatus((s) => ({ ...s, sent: false })), 5000);
    } catch (err) {
      setStatus({ sending: false, sent: false, error: err.response?.data?.message || 'Failed to send. Please try again.' });
    }
  };

  return (
    <div className="pt-24 pb-16 bg-[#F8FAFC] dark:bg-gray-900 min-h-screen">
      <Seo
        title="Contact Us"
        description="Contact Asilah Real Estate in Asilah, Morocco. Call, email or message us on WhatsApp for help finding your perfect property."
        canonical="/contact"
      />
      <section className="relative py-20 bg-gradient-to-r from-[#0F172A] to-[#1E293B] overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, #38BDF8 0%, transparent 50%)' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-bold text-white mb-4">Get in Touch</motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-gray-400 text-lg max-w-2xl mx-auto">
            We would love to hear from you. Reach out with any questions or inquiries.
          </motion.p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Send Us a Message</h2>
              {status.error && (
                <p className="p-3 mb-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                  {status.error}
                </p>
              )}
              {status.sent && (
                <p className="p-3 mb-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-sm">
                  Message sent successfully!
                </p>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Your Name" className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#38BDF8] text-sm" required />
                  <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Your Email" className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#38BDF8] text-sm" required />
                </div>
                <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="Phone Number" className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#38BDF8] text-sm" />
                <input type="text" name="subject" value={form.subject} onChange={handleChange} placeholder="Subject" className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#38BDF8] text-sm" required />
                <textarea name="message" value={form.message} onChange={handleChange} placeholder="Your Message" rows={5} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#38BDF8] text-sm resize-none" required />
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit" disabled={status.sending} className="w-full py-3 rounded-xl bg-[#38BDF8] hover:bg-[#0EA5E9] text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {status.sending ? 'Sending...' : status.sent ? 'Message Sent!' : 'Send Message'}
                </motion.button>
              </form>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Contact Information</h2>
              <div className="space-y-6 mb-8">
                {[
                  { label: 'Address', value: settings.company_address || 'Asilah Medina, Asilah 90050, Morocco', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
                  { label: 'Phone', value: settings.company_phone || '+212 5XX XX XX XX', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
                  { label: 'Email', value: settings.company_email || 'contact@asilahrealestate.com', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
                  { label: 'Working Hours', value: 'Monday - Saturday: 9:00 AM - 6:00 PM', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#38BDF8]/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-[#38BDF8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.label}</p>
                      <p className="text-gray-900 dark:text-white font-medium">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <MapComponent />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
