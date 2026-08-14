import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const SITE_NAME = 'Asilah Real Estate';
const DEFAULT_IMAGE = '/images/asilah-hero.webp';

const upsertMeta = (attr, key) => {
  const existing = document.head.querySelector(`meta[${attr}="${key}"]`);
  const el = existing || document.createElement('meta');
  el.setAttribute(attr, key);
  if (!existing) document.head.appendChild(el);
  return { el, prev: existing?.getAttribute('content') ?? null };
};

const absoluteUrl = (origin, url) => (url && url.startsWith('/') ? `${origin}${url}` : url);

const Seo = ({ title, description, image, canonical, noindex = false, jsonLd = null }) => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const url = canonical || `${origin}${pathname}`;
  const defaultTitle = t('seo.defaultTitle', `${SITE_NAME} | Properties in Asilah, Morocco`);
  const defaultDescription = t('seo.defaultDescription', 'Handpicked rentals and sales — authentic riads, beachfront apartments and charming medina houses in Asilah, Morocco.');
  const pageTitle = title ? `${title} | ${SITE_NAME}` : defaultTitle;
  const pageDescription = description || defaultDescription;
  const pageImage = absoluteUrl(origin, image || DEFAULT_IMAGE);

  useEffect(() => {
    const prevTitle = document.title;
    document.title = pageTitle;

    const metas = [
      ['name', 'description', pageDescription],
      ['name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow'],
      ['property', 'og:type', 'website'],
      ['property', 'og:site_name', SITE_NAME],
      ['property', 'og:title', pageTitle],
      ['property', 'og:description', pageDescription],
      ['property', 'og:url', url],
      ['property', 'og:image', pageImage],
      ['name', 'twitter:card', 'summary_large_image'],
      ['name', 'twitter:title', pageTitle],
      ['name', 'twitter:description', pageDescription],
      ['name', 'twitter:image', pageImage],
    ];

    const tracked = metas.map(([attr, key, value]) => {
      const { el, prev } = upsertMeta(attr, key);
      el.setAttribute('content', value);
      return { el, attr, key, prev };
    });

    document.head.querySelectorAll('link[rel="canonical"]').forEach((link) => link.remove());
    const canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    canonicalEl.setAttribute('href', url);
    document.head.appendChild(canonicalEl);

    const prevJsonLd = document.getElementById('seo-jsonld');
    const prevJsonLdContent = prevJsonLd?.textContent ?? null;
    if (jsonLd) {
      const script = prevJsonLd || document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'seo-jsonld';
      if (!prevJsonLd) document.head.appendChild(script);
      script.textContent = JSON.stringify(jsonLd);
    } else if (prevJsonLd) {
      prevJsonLd.remove();
    }

    return () => {
      document.title = prevTitle;
      tracked.forEach(({ el, prev }) => {
        if (prev === null) {
          el.remove();
        } else {
          el.setAttribute('content', prev);
        }
      });
      canonicalEl.remove();
      const current = document.getElementById('seo-jsonld');
      if (current) {
        if (prevJsonLdContent === null) current.remove();
        else current.textContent = prevJsonLdContent;
      }
    };
  }, [pageTitle, pageDescription, pageImage, url, noindex, jsonLd]);

  return null;
};

export default Seo;
