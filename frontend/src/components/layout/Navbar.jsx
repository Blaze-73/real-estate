import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { logoutUser } from '../../store/slices/authSlice';
import { fetchWishlist } from '../../store/slices/wishlistSlice';
import ThemeToggle from '../common/ThemeToggle';
import LanguageSwitcher from '../common/LanguageSwitcher';

const Brand = () => {
  const { t } = useTranslation();
  return (
    <Link to="/" className="flex items-center gap-3" aria-label={t('nav.brandAria')}>
      <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-ink-950 dark:bg-white/95 shadow-lg shadow-ink-950/30">
        <svg className="h-5 w-5 text-white dark:text-ink-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M2 12l3-3m0 0l7-7 7 7m-14 0v10a1 1 0 001 1h4m8-11l2 2m-2-2v10a1 1 0 01-1 1h-6m-4 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1" />
        </svg>
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-ocean-400 ring-2 ring-ink-950 dark:ring-white/95" />
      </span>
      <span className="leading-tight">
        <span className="block font-display text-lg font-semibold tracking-tight text-white">
          Asilah
        </span>
        <span className="block text-[10px] font-semibold uppercase tracking-[0.3em] text-ocean-300">
          Estates
        </span>
      </span>
    </Link>
  );
};

const Navbar = () => {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { token } = useSelector((state) => state.auth);
  const wishlistCount = useSelector((state) => state.wishlist.slugs.length);
  const wishlistLoaded = useSelector((state) => state.wishlist.loaded);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    if (token && !wishlistLoaded) dispatch(fetchWishlist());
  }, [token, wishlistLoaded, dispatch]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/properties', label: t('nav.properties') },
    { to: '/about', label: t('nav.about') },
    { to: '/contact', label: t('nav.contact') },
  ];

  const isActive = (to) => (to === '/' ? location.pathname === '/' : location.pathname.startsWith(to));

  const solid = scrolled || !isHome;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        solid ? 'bg-ink-950/90 backdrop-blur-xl' : 'bg-gradient-to-b from-ink-950/60 to-transparent backdrop-blur-[2px]'
      }`}
      aria-label="Main navigation"
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-[#ececf0] focus:px-4 focus:py-2 focus:text-sm focus:text-ink-950"
      >
        {t('nav.skipToContent')}
      </a>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3.5 md:py-4">
          <Brand />

          <div className="hidden md:flex items-center gap-9">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                aria-current={isActive(link.to) ? 'page' : undefined}
                className={`relative text-sm font-medium transition-colors duration-300 after:absolute after:-bottom-1.5 after:left-0 after:h-px after:bg-ocean-400 after:transition-all after:duration-300 ${
                  isActive(link.to)
                    ? 'text-white after:w-full'
                    : 'text-sand-100/80 hover:text-white after:w-0 hover:after:w-full'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle />
            {token ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/account/favorites"
                  aria-label={t('nav.favorites')}
                  className="relative grid h-11 w-11 place-items-center rounded-xl border border-white/20 text-white transition-colors hover:bg-white/10"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {wishlistCount > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-terra-500 px-1 text-[10px] font-bold text-white ring-2 ring-ink-950">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/account/saved-searches"
                  className="rounded-xl border border-white/20 px-4 py-2.5 text-sm text-white transition-colors hover:bg-white/10"
                >
                  {t('nav.myAlerts')}
                </Link>
                <Link
                  to="/admin"
                  className="rounded-xl bg-[#ececf0] px-5 py-2.5 text-sm font-semibold text-ink-950 transition-colors hover:bg-white"
                >
                  {t('nav.dashboard')}
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-xl border border-white/20 px-4 py-2.5 text-sm text-white transition-colors hover:bg-white/10"
                >
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="rounded-xl bg-[#ececf0] px-5 py-2.5 text-sm font-semibold text-ink-950 transition-colors hover:bg-white"
              >
                {t('nav.login')}
              </Link>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="relative z-50 grid h-11 w-11 place-items-center rounded-xl border border-white/15 bg-white/10 backdrop-blur-md text-white md:hidden"
            aria-label={menuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
            aria-expanded={menuOpen}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round">
              {menuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden bg-ink-950/95 backdrop-blur-xl border-t border-white/10 max-h-[calc(100dvh-4.5rem)] overflow-y-auto"
          >
            <div className="px-4 py-5 space-y-1.5">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  aria-current={isActive(link.to) ? 'page' : undefined}
                  className={`flex items-center justify-between rounded-xl px-4 py-3.5 text-[15px] transition-colors ${
                    isActive(link.to)
                      ? 'bg-white/10 text-ocean-300'
                      : 'text-sand-100/85 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                  <svg className="h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}

              <Link
                to="/admin"
                onClick={() => setMenuOpen(false)}
                aria-current={isActive('/admin') ? 'page' : undefined}
                className={`flex items-center justify-between rounded-xl px-4 py-3.5 text-[15px] transition-colors ${
                  isActive('/admin')
                    ? 'bg-white/10 text-ocean-300'
                    : 'text-sand-100/85 hover:text-white hover:bg-white/5'
                }`}
              >
                {t('nav.dashboard')}
                <svg className="h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              {token && (
                <button
                  type="button"
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-[15px] text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                >
                  {t('nav.logout')}
                  <svg className="h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              )}

              <div className="flex items-center gap-3 pt-4 mt-4 border-t border-white/10">
                <LanguageSwitcher />
                <ThemeToggle />
                {token ? (
                  <>
                    <Link
                      to="/account/favorites"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-center text-sm font-medium text-white"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {t('nav.favorites')}
                      {wishlistCount > 0 && (
                        <span className="grid h-5 min-w-5 place-items-center rounded-full bg-terra-500 px-1 text-[10px] font-bold text-white">
                          {wishlistCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      to="/account/saved-searches"
                      onClick={() => setMenuOpen(false)}
                      className="rounded-xl border border-white/20 px-4 py-3 text-center text-sm font-medium text-white"
                    >
                      {t('nav.myAlerts')}
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="flex-1 rounded-xl bg-[#ececf0] px-4 py-3 text-center text-sm font-semibold text-ink-950"
                  >
                    {t('nav.login')}
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
