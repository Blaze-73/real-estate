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

const IMG = {
  hero: 'https://travelourplanet.com/wp-content/uploads/2024/01/Asilah-Cosa-Vedere-Dove-Dormire-e-le-Spiagge-Piu-Belle-di-Asilah.jpg',
  mural: 'https://almanatour.com/wp-content/uploads/2024/11/arte-callejero-Asilah-1024x576.jpg',
  souks: 'https://www.revigorate.com/images/souvenirs-in-the-medina-of-Asilah.jpg',
  blue: 'https://asilah.city/wp-content/uploads/2023/05/maisons-blanches-et-bleues-au-coeur-de-la-medina-de-Asilah.jpeg',
};

const NEIGHBORHOODS = ['The Medina', 'The Port', 'Rmel Bay', 'Sidi Mghait', 'African Square', 'House of Mirrors', 'Cercle de la Paix', 'Beachfront'];

const easeOut = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.09, duration: 0.7, ease: easeOut },
  }),
};

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { featured, loading } = useSelector((state) => state.properties);
  const settings = useSelector((state) => state.settings.settings) || {};

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
    <div className="font-sans text-ink-900 dark:text-sand-50">
      {/* ============ HERO ============ */}
      <header className="relative flex min-h-[100svh] flex-col overflow-hidden bg-ink-950">
        <div className="absolute inset-0">
          <img
            src={IMG.hero}
            alt="The shoreline of Asilah stretching toward the Atlantic"
            className="h-full w-full animate-kenburns object-cover"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink-950/75 via-ink-950/20 to-ink-950/85" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-950/55 via-transparent to-ink-950/30" />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-end px-5 pb-28 pt-32 sm:px-8 md:justify-center md:pb-40 lg:px-10">
          <motion.span
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeOut }}
            className="mb-5 inline-flex w-fit items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-sand-100 backdrop-blur-md"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-ocean-300" />
            Asilah &middot; Atlantic coast, Morocco
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.8, ease: easeOut }}
            className="max-w-4xl text-balance font-display text-[2.4rem] font-medium leading-[1.04] tracking-tight text-white sm:text-6xl lg:text-7xl"
          >
            Homes that hold
            <span className="block italic text-ocean-300">the Atlantic light.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24, duration: 0.8, ease: easeOut }}
            className="mt-6 max-w-xl text-base leading-relaxed text-sand-100/85 sm:text-lg"
          >
            Handpicked riads, medina houses and beachfront apartments across Morocco's
            northern coast &mdash; sourced, managed and loved by people who live here.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.34, duration: 0.8, ease: easeOut }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <Link
              to="/properties"
              className="group inline-flex items-center gap-2.5 rounded-full bg-ocean-500 px-7 py-3.5 text-sm font-semibold text-white shadow-xl shadow-ocean-500/25 transition-all hover:bg-ocean-400 hover:shadow-ocean-400/30"
            >
              Browse listings
              <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14m-6-6 6 6-6 6" />
              </svg>
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/10"
            >
              Talk to us
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.8 }}
            className="mt-12 hidden items-center gap-3 text-sm text-sand-100/70 md:flex"
          >
            <span className="flex items-center gap-1 text-gold-400" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </span>
            Rated 4.9 by 500+ residents and owners
          </motion.div>
        </div>

        {/* scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="absolute bottom-24 left-1/2 z-10 hidden -translate-x-1/2 md:block"
          aria-hidden="true"
        >
          <div className="flex h-10 w-6 items-start justify-center rounded-full border border-white/30 p-1.5">
            <span className="h-2 w-1 animate-cue rounded-full bg-sand-100" />
          </div>
        </motion.div>
      </header>

      {/* ============ SEARCH DOCK ============ */}
      <section className="relative z-20 px-5 sm:px-8 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7, ease: easeOut }}
          className="mx-auto -mt-10 max-w-7xl rounded-3xl bg-white p-5 shadow-2xl shadow-ink-950/15 ring-1 ring-ink-100 md:-mt-14 md:p-7 dark:bg-ink-900 dark:ring-ink-800"
        >
          <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-display text-xl font-semibold tracking-tight text-ink-900 dark:text-sand-50">
              Find your place
            </h2>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-ink-400">
              Rent &middot; Buy &middot; Long-stay
            </p>
          </div>
          <SearchBar onSearch={handleSearch} />
        </motion.div>
      </section>

      {/* ============ NEIGHBORHOOD MARQUEE ============ */}
      <div
        className="relative mt-14 overflow-hidden border-y border-white/10 bg-ink-950 py-4"
        aria-hidden="true"
      >
        <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex items-center gap-10">
              {NEIGHBORHOODS.map((place) => (
                <span key={`${copy}-${place}`} className="flex items-center gap-10">
                  <span className="font-display text-sm font-medium italic tracking-wide text-sand-100/70">
                    {place}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-ocean-400" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ============ EXPLORE ASILAH ============ */}
      <section className="bg-sand-50 py-20 lg:py-28 dark:bg-ink-950">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-5 sm:px-8 lg:grid-cols-12 lg:items-center lg:px-10">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="lg:col-span-6"
          >
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-ocean-600 dark:text-ocean-300">
              The town &middot; #1 hidden gem
            </p>
            <h2 className="max-w-xl text-balance font-display text-4xl font-medium leading-[1.08] tracking-tight text-ink-900 sm:text-5xl dark:text-sand-50">
              Whitewashed streets,
              <span className="block italic text-terra-500 dark:text-terra-300">woven with the sea.</span>
            </h2>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-ink-500 dark:text-ink-300">
              A fortified medina of lime-washed walls, cobalt doors and hand-painted murals, set
              against one of Morocco's most walkable beaches. This is the Asilah we know best &mdash;
              and the one we'd love to open up for you.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/properties"
                className="group inline-flex items-center gap-2 rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-ink-800 dark:bg-sand-50 dark:text-ink-950 dark:hover:bg-sand-100"
              >
                View properties
                <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14m-6-6 6 6-6 6" />
                </svg>
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 rounded-full border border-ink-200 px-6 py-3 text-sm font-semibold text-ink-800 transition-colors hover:border-ink-900 dark:border-ink-700 dark:text-sand-100 dark:hover:border-sand-100"
              >
                About Asilah
              </Link>
            </div>
          </motion.div>

          {/* collage */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="relative lg:col-span-6"
          >
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.7, ease: easeOut }}
                className="col-span-2 overflow-hidden rounded-2xl"
              >
                <img src={IMG.mural} alt="Street art murals painted on Asilah's medina walls" loading="lazy" className="h-40 w-full object-cover transition-transform duration-700 hover:scale-105 sm:h-56" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.22, duration: 0.7, ease: easeOut }}
                className="col-span-1 overflow-hidden rounded-2xl"
              >
                <img src={IMG.blue} alt="Cobalt blue door in the whitewashed medina" loading="lazy" className="h-40 w-full object-cover transition-transform duration-700 hover:scale-105 sm:h-56" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.34, duration: 0.7, ease: easeOut }}
                className="col-span-1 overflow-hidden rounded-2xl"
              >
                <img src={IMG.souks} alt="Handcrafts and souvenirs in the streets of the medina" loading="lazy" className="h-44 w-full object-cover transition-transform duration-700 hover:scale-105 sm:h-64" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.46, duration: 0.7, ease: easeOut }}
                className="col-span-2 relative overflow-hidden rounded-2xl"
              >
                <img src={IMG.hero} alt="Atlantic beachfront seen from the ramparts" loading="lazy" className="h-44 w-full object-cover transition-transform duration-700 hover:scale-105 sm:h-64" />
                <span className="absolute bottom-3 left-3 rounded-full bg-ink-950/70 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-sand-100 backdrop-blur-md">
                  Beachfront &middot; 2 min by foot
                </span>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.85, rotate: -4 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.7, ease: easeOut }}
              className="absolute -left-3 -top-5 rounded-2xl bg-terra-500 px-5 py-4 text-white shadow-xl shadow-terra-500/30 sm:-left-6 sm:-top-7"
            >
              <p className="font-display text-3xl font-semibold leading-none">10+</p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-sand-100/90">
                years of local care
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ============ FEATURED PROPERTIES ============ */}
      <section className="bg-sand-100/70 py-20 lg:py-28 dark:bg-ink-900">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
          >
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-ocean-600 dark:text-ocean-300">
                Featured &middot; handpicked
              </p>
              <h2 className="max-w-xl text-balance font-display text-4xl font-medium leading-[1.08] tracking-tight text-ink-900 sm:text-5xl dark:text-sand-50">
                Picked for their light,<span className="italic text-terra-500 dark:text-terra-300"> land and life.</span>
              </h2>
            </div>
            <div className="max-w-sm">
              <p className="text-sm leading-relaxed text-ink-500 dark:text-ink-300">
                A rotating shortlist chosen by our local team &mdash; each one visited,
                photographed and verified before it reaches your screen.
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 xl:grid-cols-3">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
              : featured.map((p) => <PropertyCard key={p._id || p.id} property={p} />)}
          </div>

          <div className="mt-14 text-center">
            <Link
              to="/properties"
              className="group inline-flex items-center gap-2.5 rounded-full border border-ink-300 px-7 py-3.5 text-sm font-semibold text-ink-900 transition-colors hover:border-ink-900 hover:bg-ink-900 hover:text-white dark:border-ink-600 dark:text-sand-50 dark:hover:border-sand-100 dark:hover:bg-sand-50 dark:hover:text-ink-950"
            >
              View all listings
              <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14m-6-6 6 6-6 6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ============ WHY CHOOSE US ============ */}
      <section className="bg-ink-950 py-20 text-sand-100 lg:py-28">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-14 px-5 sm:px-8 lg:grid-cols-12 lg:px-10">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="lg:col-span-5"
          >
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-ocean-300">
              Why choose us
            </p>
            <h2 className="max-w-md text-balance font-display text-4xl font-medium leading-[1.08] tracking-tight sm:text-5xl">
              Local roots.<span className="block italic text-terra-300">Honest deals.</span>
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-sand-100/70">
              We are a small Asilah team, not a faceless platform. Every listing is walked
              through, every price is a conversation.
            </p>
            <Link
              to="/about"
              className="group mt-8 inline-flex items-center gap-2 text-sm font-semibold text-ocean-300 transition-colors hover:text-ocean-200"
            >
              Meet the team
              <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14m-6-6 6 6-6 6" />
              </svg>
            </Link>
          </motion.div>

          <div className="lg:col-span-7">
            <div className="divide-y divide-white/10">
              {[
                {
                  n: '01',
                  title: 'Verified listings',
                  copy: 'Each property is physically checked, ownership is confirmed and photos are taken on-site — no stock, no surprises.',
                  icon: 'M9 12l2 2 4-4m5.618 4.016a4.5 4.5 0 00-2.198-5.888 4.5 4.5 0 00-5.186.364L12 6l-.104.1a4.5 4.5 0 00-6.058.507 4.5 4.5 0 002.982 7.633L9.382 18l2.618 2.5 2.618-2.5 3.382.913a4.5 4.5 0 00-1.002-8.897z',
                },
                {
                  n: '02',
                  title: 'Local experts',
                  copy: 'A season-round team on the ground in the medina and the beachfront — showing homes, managing stays and resolving issues within hours.',
                  icon: 'M12 4.354a4 4 0 10-5.5 5.65 4 4 0 00-.167 1.5 4 4 0 005.667 1.232V21m4.5-1.5v-.5a4.5 4.5 0 013-4.215',
                },
                {
                  n: '03',
                  title: 'Hassle-free booking',
                  copy: 'Transparent contracts, secure payments and a single friendly point of contact from first message to final handover.',
                  icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
                },
              ].map((item) => (
                <motion.div
                  key={item.n}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: '-80px' }}
                  className="group grid gap-4 py-8 sm:grid-cols-[3.5rem_1fr] sm:gap-6"
                >
                  <span className="font-display text-2xl font-light italic text-sand-100/25 transition-colors duration-300 group-hover:text-ocean-300 sm:text-3xl">
                    {item.n}
                  </span>
                  <div className="sm:grid sm:grid-cols-[1fr_2fr] sm:gap-8">
                    <h3 className="flex items-center gap-3 font-display text-2xl font-medium tracking-tight text-white">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/5 text-ocean-300 ring-1 ring-white/10">
                        <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d={item.icon} />
                        </svg>
                      </span>
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-sand-100/65 sm:mt-0">
                      {item.copy}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <StatisticsSection />

      {/* ============ VISIT US ============ */}
      <section className="bg-sand-50 py-20 lg:py-28 dark:bg-ink-950">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:px-10">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
          >
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-ocean-600 dark:text-ocean-300">
              Find us in the medina
            </p>
            <h2 className="max-w-xl text-balance font-display text-4xl font-medium leading-[1.08] tracking-tight text-ink-900 sm:text-5xl dark:text-sand-50">
              Come see Asilah <span className="italic text-terra-500 dark:text-terra-300">in person.</span>
            </h2>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-ink-500 dark:text-ink-300">
              Our office sits a two-minute walk from Bab Al Kasbah. Drop by for coffee,
              a walk-through of the port, or to see a home before anyone else does.
            </p>

            <ul className="mt-8 space-y-4">
              {[
                {
                  icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z',
                  value: settings.company_address || 'Asilah Medina, Asilah, Morocco',
                },
                {
                  icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498A1 1 0 0121 15.72V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
                  value: settings.company_phone || '+212 5XX XX XX XX',
                },
                {
                  icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
                  value: settings.company_email || 'contact@asilahrealestate.com',
                },
              ].map((row) => (
                <li key={row.value} className="flex items-center gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ocean-50 text-ocean-600 ring-1 ring-ocean-100 dark:bg-ocean-900/40 dark:text-ocean-300 dark:ring-ocean-800">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d={row.icon} />
                    </svg>
                  </span>
                  <span className="text-sm font-medium text-ink-700 dark:text-sand-100">{row.value}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: easeOut }}
            className="relative"
          >
            <MapComponent />
            <div className="absolute -bottom-5 left-6 rounded-2xl bg-white px-5 py-4 shadow-xl ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-800">
              <p className="font-display text-lg font-semibold text-ink-900 dark:text-sand-50">Open daily &middot; 9:00&ndash;19:00</p>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-ocean-600 dark:text-ocean-300">Visits by appointment</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="bg-sand-100/70 py-20 lg:py-28 dark:bg-ink-900">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-12 md:items-end"
          >
            <div className="md:col-span-8">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-ocean-600 dark:text-ocean-300">
                Kind words
              </p>
              <h2 className="max-w-2xl text-balance font-display text-4xl font-medium leading-[1.08] tracking-tight text-ink-900 sm:text-5xl dark:text-sand-50">
                The people who <span className="italic text-terra-500 dark:text-terra-300">now call it home.</span>
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-ink-500 md:col-span-4 dark:text-ink-300">
              Owners, tenants and buyers &mdash; a few of the hundreds who found their place
              through our team.
            </p>
          </motion.div>
          <TestimonialCarousel />
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="relative overflow-hidden bg-ink-950 py-20 text-sand-100 lg:py-28">
        <div className="absolute inset-0" aria-hidden="true">
          <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-ocean-600/25 blur-3xl" />
          <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-terra-500/20 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(rgba(244,240,232,0.06)_1px,transparent_1px)] [background-size:22px_22px]" />
        </div>
        <div className="relative mx-auto max-w-5xl px-5 text-center sm:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
          >
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-ocean-300">
              No-fee viewings &middot; Licensed agency
            </p>
            <h2 className="mx-auto max-w-3xl text-balance font-display text-4xl font-medium leading-[1.08] tracking-tight sm:text-6xl">
              Ready to find your place <span className="italic text-terra-300">in Asilah?</span>
            </h2>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/properties"
                className="group inline-flex items-center gap-2.5 rounded-full bg-ocean-500 px-8 py-4 text-sm font-semibold text-white shadow-xl shadow-ocean-500/25 transition-all hover:bg-ocean-400"
              >
                Browse listings
                <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14m-6-6 6 6-6 6" />
                </svg>
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 px-8 py-4 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Contact us
              </Link>
            </div>
            <p className="mt-8 text-xs font-medium uppercase tracking-[0.2em] text-sand-100/50">
              Answers within 24 hours &middot; English, Arabic &amp; French
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;