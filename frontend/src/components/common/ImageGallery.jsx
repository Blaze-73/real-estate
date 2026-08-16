import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ImageGallery = ({ images = [] }) => {
  const [current, setCurrent] = useState(0);
  const gallery = images.length > 0 ? images : ['https://placehold.co/800x500/0B141B/1f94af?text=Asilah'];

  const next = () => setCurrent((prev) => (prev + 1) % gallery.length);
  const prev = () => setCurrent((prev) => (prev - 1 + gallery.length) % gallery.length);

  return (
    <div className="relative rounded-2xl overflow-hidden bg-ink-950">
      <div className="relative h-[400px] md:h-[500px]">
        <AnimatePresence mode="wait">
          <motion.img
            key={current}
            src={gallery[current]}
            alt={`Image ${current + 1}`}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>
        {gallery.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>
      {gallery.length > 1 && (
        <div className="flex gap-2 p-3 overflow-x-auto">
          {gallery.map((img, idx) => (
            <button key={idx} onClick={() => setCurrent(idx)} className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${idx === current ? 'border-[#1f94af]' : 'border-transparent'}`}>
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;

