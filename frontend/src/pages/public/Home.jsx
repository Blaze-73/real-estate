import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { fetchFeatured } from '../../store/slices/propertySlice';
import PropertyCard from '../../components/common/PropertyCard';
import SearchBar from '../../components/common/SearchBar';
import TestimonialCarousel from '../../components/common/TestimonialCarousel';
import testimonialService from '../../services/testimonialService';
import MapComponent from '../../components/common/MapComponent';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import Seo from '../../components/common/Seo';

const IMG = {
  hero: '/images/asilah-hero.webp',
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
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { featured, loading } = useSelector((state) => state.properties);
  const settings = useSelector((state) => state.settings.settings) || {};
  const [hasTestimonials, setHasTestimonials] = useState(false);
  const waDigits = (settings.whatsapp_number || settings.company_phone || '').replace(/[^0-9]/g, '');
  const whatsappHref =
    waDigits.length >= 8
      ? `https://wa.me/${waDigits}?text=${encodeURIComponent(t('home.whatsappIntro'))}`
      : '/contact';

  useEffect(() => {
    dispatch(fetchFeatured());
  }, [dispatch]);

  useEffect(() => {
    let cancelled = false;
    testimonialService
      .getAll()
      .then((data) => {
        if (!cancelled) setHasTestimonials(Array.isArray(data) && data.length > 0);
      })
      .catch(() => {
        if (!cancelled) setHasTestimonials(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSearch = (filters) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div className="font-sans text-ink-900 dark:text-sand-50">
      <Seo
        title={t('home.title')}
        description={t('home.description')}
        canonical="/"
      />
      {/* ============ HERO ============ */}
      <header className="relative flex min-h-[100svh] flex-col overflow-hidden bg-ink-950">
        <div className="absolute inset-0">
          <img
            src={IMG.hero}
            alt={t('home.heroImgAlt')}
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
            {t('home.heroBadge')}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.8, ease: easeOut }}
            className="max-w-4xl text-balance font-display text-[2.4rem] font-medium leading-[1.04] tracking-tight text-white sm:text-6xl lg:text-7xl"
          >
            {t('home.heroTitle1')}
            <span className="block italic text-ocean-300">{t('home.heroTitle2')}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24, duration: 0.8, ease: easeOut }}
            className="mt-6 max-w-xl text-base leading-relaxed text-sand-100/85 sm:text-lg"
          >
            {t('home.heroSub')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.34, duration: 0.8, ease: easeOut }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <Link
              to="/properties"
              className="group inline-flex items-center gap-2.5 rounded-full bg-[#ececf0] px-7 py-3.5 text-sm font-semibold text-ink-950 shadow-xl shadow-ocean-500/25 transition-all hover:bg-white hover:shadow-ocean-400/30"
            >
              {t('home.browseListings')}
              <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14m-6-6 6 6-6 6" />
              </svg>
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/10"
            >
              {t('home.talkToUs')}
            </Link>
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
              {t('home.findYourPlace')}
            </h2>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-ink-400">
              {t('home.rentBuyLong')}
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
              {t('home.townEyebrow')}
            </p>
            <h2 className="max-w-xl text-balance font-display text-4xl font-medium leading-[1.08] tracking-tight text-ink-900 sm:text-5xl dark:text-sand-50">
              {t('home.townTitle1')}
              <span className="block italic text-terra-500 dark:text-terra-300">{t('home.townTitle2')}</span>
            </h2>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-ink-500 dark:text-ink-300">
              {t('home.townCopy')}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/properties"
                className="group inline-flex items-center gap-2 rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-ink-800 dark:bg-sand-50 dark:text-ink-950 dark:hover:bg-sand-100"
              >
                {t('home.viewProperties')}
                <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14m-6-6 6 6-6 6" />
                </svg>
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 rounded-full border border-ink-200 px-6 py-3 text-sm font-semibold text-ink-800 transition-colors hover:border-ink-900 dark:border-ink-700 dark:text-sand-100 dark:hover:border-sand-100"
              >
                {t('home.aboutAsilah')}
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
                <img src={IMG.mural} alt={t('home.muralImgAlt')} loading="lazy" className="h-40 w-full object-cover transition-transform duration-700 hover:scale-105 sm:h-56" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.22, duration: 0.7, ease: easeOut }}
                className="col-span-1 overflow-hidden rounded-2xl"
              >
                <img src={IMG.blue} alt={t('home.blueImgAlt')} loading="lazy" className="h-40 w-full object-cover transition-transform duration-700 hover:scale-105 sm:h-56" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.34, duration: 0.7, ease: easeOut }}
                className="col-span-1 overflow-hidden rounded-2xl"
              >
                <img src={IMG.souks} alt={t('home.souksImgAlt')} loading="lazy" className="h-44 w-full object-cover transition-transform duration-700 hover:scale-105 sm:h-64" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.46, duration: 0.7, ease: easeOut }}
                className="col-span-2 relative overflow-hidden rounded-2xl"
              >
                <img src={IMG.hero} alt={t('home.beachImgAlt')} loading="lazy" className="h-44 w-full object-cover transition-transform duration-700 hover:scale-105 sm:h-64" />
                <span className="absolute bottom-3 left-3 rounded-full bg-ink-950/70 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-sand-100 backdrop-blur-md">
                  {t('home.beachfrontBadge')}
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
              <p className="font-display text-3xl font-semibold leading-none">100%</p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-sand-100/90">
                {t('home.yearsLocalCare')}
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
                {t('home.featuredEyebrow')}
              </p>
              <h2 className="max-w-xl text-balance font-display text-4xl font-medium leading-[1.08] tracking-tight text-ink-900 sm:text-5xl dark:text-sand-50">
                {t('home.featuredTitle1')}<span className="italic text-terra-500 dark:text-terra-300"> {t('home.featuredTitle2')}</span>
              </h2>
            </div>
            <div className="max-w-sm">
              <p className="text-sm leading-relaxed text-ink-500 dark:text-ink-300">
                {t('home.featuredCopy')}
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
              {t('home.viewAllListings')}
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
              {t('home.whyEyebrow')}
            </p>
            <h2 className="max-w-md text-balance font-display text-4xl font-medium leading-[1.08] tracking-tight sm:text-5xl">
              {t('home.whyTitle1')}<span className="block italic text-terra-300">{t('home.whyTitle2')}</span>
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-sand-100/70">
              {t('home.whyCopy')}
            </p>
            <Link
              to="/about"
              className="group mt-8 inline-flex items-center gap-2 text-sm font-semibold text-ocean-300 transition-colors hover:text-ocean-200"
            >
              {t('home.meetTheTeam')}
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
                  title: t('home.verifiedTitle'),
                  copy: t('home.verifiedCopy'),
                  icon: 'M9 12l2 2 4-4m5.618 4.016a4.5 4.5 0 00-2.198-5.888 4.5 4.5 0 00-5.186.364L12 6l-.104.1a4.5 4.5 0 00-6.058.507 4.5 4.5 0 002.982 7.633L9.382 18l2.618 2.5 2.618-2.5 3.382.913a4.5 4.5 0 00-1.002-8.897z',
                },
                {
                  n: '02',
                  title: t('home.expertsTitle'),
                  copy: t('home.expertsCopy'),
                  icon: 'M12 4.354a4 4 0 10-5.5 5.65 4 4 0 00-.167 1.5 4 4 0 005.667 1.232V21m4.5-1.5v-.5a4.5 4.5 0 013-4.215',
                },
                {
                  n: '03',
                  title: t('home.bookingTitle'),
                  copy: t('home.bookingCopy'),
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
              {t('home.visitEyebrow')}
            </p>
            <h2 className="max-w-xl text-balance font-display text-4xl font-medium leading-[1.08] tracking-tight text-ink-900 sm:text-5xl dark:text-sand-50">
              {t('home.visitTitle1')} <span className="italic text-terra-500 dark:text-terra-300">{t('home.visitTitle2')}</span>
            </h2>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-ink-500 dark:text-ink-300">
              {t('home.visitCopy')}
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
              <p className="font-display text-lg font-semibold text-ink-900 dark:text-sand-50">{t('home.openDaily')}</p>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-ocean-600 dark:text-ocean-300">{t('home.visitsAppointment')}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      {hasTestimonials && (
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
                {t('home.kindWords')}
              </p>
              <h2 className="max-w-2xl text-balance font-display text-4xl font-medium leading-[1.08] tracking-tight text-ink-900 sm:text-5xl dark:text-sand-50">
                {t('home.testimonialsTitle1')} <span className="italic text-terra-500 dark:text-terra-300">{t('home.testimonialsTitle2')}</span>
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-ink-500 md:col-span-4 dark:text-ink-300">
              {t('home.testimonialsCopy')}
            </p>
          </motion.div>
          <TestimonialCarousel onLoaded={setHasTestimonials} />
        </div>
      </section>
      )}

      {/* ============ CTA ============ */}
      <section className="relative overflow-hidden bg-ink-950 py-20 text-sand-100 lg:py-28">
        <div className="absolute inset-0" aria-hidden="true">
          <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-ocean-600/25 blur-3xl" />
          <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-terra-500/20 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-5xl px-5 text-center sm:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
          >
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-ocean-300">
              {t('home.ctaEyebrow')}
            </p>
            <h2 className="mx-auto max-w-3xl text-balance font-display text-4xl font-medium leading-[1.08] tracking-tight sm:text-6xl">
              {t('home.ctaTitle1')} <span className="italic text-terra-300">{t('home.ctaTitle2')}</span>
            </h2>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/properties"
                className="group inline-flex items-center gap-2.5 rounded-full bg-[#ececf0] px-8 py-4 text-sm font-semibold text-ink-950 shadow-xl shadow-ocean-500/25 transition-all hover:bg-white"
              >
                {t('home.browseListings')}
                <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14m-6-6 6 6-6 6" />
                </svg>
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 px-8 py-4 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                {t('home.contactUs')}
              </Link>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 px-8 py-4 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                {t('home.whatsappUs')}
              </a>
            </div>
            <p className="mt-8 text-xs font-medium uppercase tracking-[0.2em] text-sand-100/50">
              {t('home.answers24h')}
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
