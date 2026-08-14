import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import AnimatedCounter from '../../components/common/AnimatedCounter';
import Seo from '../../components/common/Seo';

const teamMembers = [
  { name: 'Ahmed El Amrani', role: 'Founder & CEO', bio: '15+ years of experience in Moroccan real estate market' },
  { name: 'Fatima Bennis', role: 'Operations Director', bio: 'Expert in property management and client relations' },
  { name: 'Youssef Benali', role: 'Senior Agent', bio: 'Specializing in luxury properties and international clients' },
  { name: 'Nadia Oufkir', role: 'Marketing Manager', bio: 'Digital marketing strategist with a passion for real estate' },
];

const About = () => {
  const settings = useSelector((state) => state.settings.settings) || {};

  return (
    <div className="pt-24 pb-16 bg-[#F8FAFC] dark:bg-gray-900">
      <Seo
        title="About Us"
        description="Asilah Real Estate — a trusted agency in Asilah, Morocco since 2015. Your partner for buying, selling and renting properties on the Atlantic coast."
        canonical="/about"
      />
      <section className="relative py-20 bg-gradient-to-r from-[#0F172A] to-[#1E293B] overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #38BDF8 0%, transparent 50%)' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-bold text-white mb-4">
            About Asilah Real Estate
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-gray-400 text-lg max-w-2xl mx-auto">
            Your trusted partner in Asilah's real estate market since 2015
          </motion.p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="text-[#38BDF8] font-semibold text-sm uppercase tracking-wider">Our Story</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-2 mb-6">A Decade of Excellence</h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-300 leading-relaxed">
                <p>{settings.about_us || 'Premium real estate agency in Asilah, offering exceptional properties and rental services across Northern Morocco.'}</p>
                <p>Our deep understanding of the local market, combined with professional management practices, allows us to offer unparalleled service to property owners and tenants alike.</p>
                <p>We specialize in rental properties, from beachfront apartments to traditional Moroccan riads, ensuring each property is managed with the utmost care and professionalism.</p>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="grid grid-cols-2 gap-4">
              {[
                { end: 150, suffix: '+', label: 'Properties Managed' },
                { end: 500, suffix: '+', label: 'Happy Clients' },
                { end: 10, suffix: '+', label: 'Years Experience' },
                { end: 98, suffix: '%', label: 'Satisfaction Rate' },
              ].map((stat, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-white dark:bg-[#1E293B] shadow-sm border border-gray-100 dark:border-gray-800 text-center">
                  <AnimatedCounter end={stat.end} suffix={stat.suffix} />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-[#1E293B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-[#38BDF8]/5 to-transparent border border-[#38BDF8]/10">
              <div className="w-12 h-12 rounded-xl bg-[#38BDF8]/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#38BDF8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Our Mission</h3>
              <p className="text-gray-500 dark:text-gray-400">{settings.mission || 'To provide exceptional real estate services that connect people with their perfect properties in Asilah, ensuring transparent, professional, and hassle-free experiences for property owners and tenants.'}</p>
            </div>
            <div className="p-8 rounded-2xl bg-gradient-to-br from-[#F59E0B]/5 to-transparent border border-[#F59E0B]/10">
              <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Our Vision</h3>
              <p className="text-gray-500 dark:text-gray-400">{settings.vision || 'To become the most trusted and innovative real estate platform in Northern Morocco, setting new standards for property management and client satisfaction.'}</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-10">Meet Our Team</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {teamMembers.map((member, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-6 rounded-2xl bg-white dark:bg-[#1E293B] shadow-sm border border-gray-100 dark:border-gray-800 text-center group hover:border-[#38BDF8]/30 transition-all"
                >
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#38BDF8] to-[#0EA5E9] flex items-center justify-center text-white text-2xl font-bold">
                    {member.name.charAt(0)}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{member.name}</h3>
                  <p className="text-sm text-[#38BDF8] mb-2">{member.role}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{member.bio}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;
