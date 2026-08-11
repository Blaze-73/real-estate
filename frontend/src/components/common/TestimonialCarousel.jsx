import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const testimonials = [
  {
    name: 'Ahmed Benali',
    role: 'Property Owner',
    text: 'Exceptional service! They helped me rent my villa in Asilah within a week. Professional team and excellent management.',
    rating: 5,
  },
  {
    name: 'Fatima Zahra',
    role: 'Tenant',
    text: 'Found the perfect apartment through this platform. The process was smooth and transparent. Highly recommended!',
    rating: 5,
  },
  {
    name: 'Mohamed El Amrani',
    role: 'Investor',
    text: 'As a real estate investor, I appreciate their detailed property analytics and market insights. Great partner.',
    rating: 5,
  },
  {
    name: 'Sara Bennis',
    role: 'Home Buyer',
    text: 'The team guided us through every step of buying our first home. Their expertise made all the difference.',
    rating: 4,
  },
];

const TestimonialCarousel = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.4 }}
          className="bg-white dark:bg-[#1E293B] rounded-2xl p-8 md:p-10 shadow-xl text-center"
        >
          <div className="flex justify-center gap-1 mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg key={i} className={`w-5 h-5 ${i < testimonials[current].rating ? 'text-[#F59E0B]' : 'text-gray-300 dark:text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-6 italic">"{testimonials[current].text}"</p>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">{testimonials[current].name}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">{testimonials[current].role}</p>
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="flex justify-center gap-2 mt-6">
        {testimonials.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${idx === current ? 'bg-[#38BDF8] w-8' : 'bg-gray-300 dark:bg-gray-600'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default TestimonialCarousel;
