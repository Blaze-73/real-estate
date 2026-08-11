import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchFeatured } from '../../store/slices/propertySlice';
import PropertyCard from '../../components/common/PropertyCard';
import SearchBar from '../../components/common/SearchBar';
import StatisticsSection from '../../components/common/StatisticsSection';
import TestimonialCarousel from '../../components/common/TestimonialCarousel';
import MapComponent from '../../components/common/MapComponent';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import ImageGallery from '../../components/common/ImageGallery';

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { featured, loading } = useSelector((state) => state.properties);

  useEffect(() => {
    dispatch(fetchFeatured());
  }, [dispatch]);

  const handleSearch = (filters) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div className="text-gray-900 dark:text-white">
      {/* HERO */}
      <header className="relative pt-20 md:pt-24">
        <div className="h-[60vh] lg:h-[70vh] w-full relative overflow-hidden">
          <img
            src="https://travelourplanet.com/wp-content/uploads/2024/01/Asilah-Cosa-Vedere-Dove-Dormire-e-le-Spiagge-Piu-Belle-di-Asilah.jpg"
            alt="Asilah hero"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out transform scale-100 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />

          <div className="relative z-20 max-w-7xl mx-auto px-6 py-12 lg:py-20 h-full flex flex-col justify-center">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.8 }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight"
              >
                Discover Asilah's
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-[#38BDF8] to-[#F59E0B]">most beautiful homes</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="mt-6 text-lg max-w-2xl text-white/90"
              >
                Handpicked rentals and sales — authentic riads, beachfront apartments, and charming medina houses.
              </motion.p>

              <div className="mt-8 flex items-center gap-4 flex-wrap">
                <Link to="/properties" className="inline-flex items-center gap-3 bg-white text-black px-5 py-3 rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition-all">
                  Browse Listings
                </Link>
                <Link to="/contact" className="inline-flex items-center gap-3 border border-white/30 text-white px-5 py-3 rounded-full hover:bg-white/10 transition-colors">
                  Get in touch
                </Link>
              </div>

              <div className="mt-10 max-w-lg">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                  <SearchBar onSearch={handleSearch} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* SPOTLIGHT GALLERY */}
      <section className="py-16 bg-white dark:bg-[#071029]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <motion.h2 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="text-2xl lg:text-3xl font-bold mb-4">Explore Asilah</motion.h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">A seaside town of whitewashed houses, vibrant street art and tranquil beaches. Our curated gallery captures the spirit of the medina.</p>
              <div className="flex gap-3 flex-wrap">
                <Link to="/properties" className="px-4 py-2 bg-[#38BDF8] text-white rounded-lg hover:bg-[#0EA5E9] transition-colors">View Properties</Link>
                <Link to="/about" className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">About Asilah</Link>
              </div>
            </div>
            <div>
              <ImageGallery images={[
                'https://almanatour.com/wp-content/uploads/2024/11/arte-callejero-Asilah-1024x576.jpg',
                'https://www.revigorate.com/images/souvenirs-in-the-medina-of-Asilah.jpg',
                'https://asilah.city/wp-content/uploads/2023/05/maisons-blanches-et-bleues-au-coeur-de-la-medina-de-Asilah.jpeg'
              ]} />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED PROPERTIES */}
      <section className="py-16 bg-white dark:bg-[#1E293B]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-semibold">Featured Listings</h3>
              <p className="text-sm text-gray-500">Top picks in Asilah chosen for quality and location.</p>
            </div>
            <Link to="/properties" className="text-sm text-[#38BDF8] hover:underline font-medium">See all</Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />) : featured.map((p) => <PropertyCard key={p._id || p.id} property={p} />)}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="py-16 bg-gradient-to-r from-[#F8FAFC] to-white dark:from-gray-900 dark:to-[#1E293B]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white dark:bg-[#0F172A] rounded-2xl shadow-md">
              <h4 className="font-semibold mb-2">Verified Listings</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Each property is vetted for authenticity and quality.</p>
            </div>
            <div className="p-6 bg-white dark:bg-[#0F172A] rounded-2xl shadow-md">
              <h4 className="font-semibold mb-2">Local Experts</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">On-the-ground team to help you find and manage your property.</p>
            </div>
            <div className="p-6 bg-white dark:bg-[#0F172A] rounded-2xl shadow-md">
              <h4 className="font-semibold mb-2">Hassle-free Booking</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Secure payments and streamlined guest communications.</p>
            </div>
          </div>
        </div>
      </section>

      <StatisticsSection />

      <section className="py-16 bg-white dark:bg-[#1E293B]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4">Visit Us in Asilah</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">Our office is located in the medina — stop by to see properties in person.</p>
              <div className="space-y-3">
                <div className="text-sm text-gray-500 dark:text-gray-400">Asilah Medina, Asilah, Morocco</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">+212 5XX XX XX XX</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">contact@asilahrealestate.com</div>
              </div>
            </div>
            <MapComponent />
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#F8FAFC] dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h3 className="text-2xl font-bold mb-6">What clients say</h3>
            <TestimonialCarousel />
          </motion.div>
        </div>
      </section>

      <footer className="py-8 text-center text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-[#0F172A]">
        © {new Date().getFullYear()} Asilah Estates. All rights reserved.
      </footer>
    </div>
  );
};

export default Home;


