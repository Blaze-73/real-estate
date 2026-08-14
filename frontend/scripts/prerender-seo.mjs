import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync, existsSync } from 'node:fs';

const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const SITE_NAME = 'Asilah Real Estate';
const DEFAULT_DESCRIPTION = 'Handpicked rentals and sales — authentic riads, beachfront apartments and charming medina houses in Asilah, Morocco.';
const DEFAULT_IMAGE = '/images/asilah-hero.webp';

const env = { ...process.env };
if (existsSync(join(dirname(fileURLToPath(import.meta.url)), '..', '.env'))) {
  for (const line of readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', '.env'), 'utf8').split('\n')) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, '');
  }
}

const API_BASE = (env.VITE_API_URL || 'http://localhost:8000/api/v1').replace(/\/$/, '');
const ORIGIN = env.VITE_SITE_URL || API_BASE.replace(/\/api\/v1$/, '').replace(/\/$/, '');

const SCHEMA_TYPES = {
  villa: 'SingleFamilyResidence',
  house: 'House',
  apartment: 'Apartment',
  studio: 'Apartment',
  commercial: 'Office',
};

const esc = (value) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const jsonLdFor = (property) => {
  const url = `${ORIGIN}/properties/${property.slug}`;
  const price = property.nightly_price ?? property.monthly_price ?? property.price;
  const city = property.city || 'Asilah';

  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: (property.description || `${property.title} in ${city}, Morocco`).slice(0, 160),
    url,
    datePosted: property.created_at ? String(property.created_at).slice(0, 10) : undefined,
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency: 'MAD',
      businessFunction: 'https://schema.org/LeaseOut',
      availability: property.status === 'available' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url,
    },
    itemOffered: {
      '@type': SCHEMA_TYPES[property.type] || 'Accommodation',
      name: property.title,
      numberOfRooms: property.bedrooms,
      numberOfBathroomsTotal: property.bathrooms,
      floorSize: property.surface ? { '@type': 'QuantitativeValue', value: property.surface, unitCode: 'MTK' } : undefined,
      image: property.cover || undefined,
      address: {
        '@type': 'PostalAddress',
        streetAddress: property.address || undefined,
        addressLocality: city,
        addressCountry: 'MA',
      },
      geo: property.latitude && property.longitude
        ? { '@type': 'GeoCoordinates', latitude: Number(property.latitude), longitude: Number(property.longitude) }
        : undefined,
      containedInPlace: {
        '@type': 'Place',
        name: city,
        containedInPlace: { '@type': 'Country', name: 'Morocco' },
      },
    },
  };
};

const renderPage = (template, { title, description, path, image, jsonLd, body }) => {
  const pageTitle = `${title} | ${SITE_NAME}`;
  const pageImage = image && !image.startsWith('http') ? `${ORIGIN}${image}` : image || `${ORIGIN}${DEFAULT_IMAGE}`;
  const canonical = `${ORIGIN}${path}`;

  const meta = `
  <meta name="description" content="${esc(description)}" />
  <meta name="robots" content="index, follow" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="${SITE_NAME}" />
  <meta property="og:title" content="${esc(pageTitle)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:image" content="${pageImage}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(pageTitle)}" />
  <meta name="twitter:description" content="${esc(description)}" />
  <meta name="twitter:image" content="${pageImage}" />
  <link rel="canonical" href="${canonical}" />`;

  const jsonLdTag = jsonLd ? `\n  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : '';

  return template
    .replace(/<title>.*<\/title>/, `<title>${esc(pageTitle)}</title>`)
    .replace('</head>', `${meta}${jsonLdTag}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${body || ''}</div>`);
};

const propertyBody = (p) => `
  <article>
    <h1>${esc(p.title)}</h1>
    <p>${esc(p.address ? `${p.address}, ${p.city}` : p.city || 'Asilah, Morocco')}</p>
    <p>${esc(p.nightly_price ? `${p.nightly_price} MAD / night` : p.monthly_price ? `${p.monthly_price} MAD / month` : 'Contact for price')}</p>
    <ul>
      <li>Bedrooms: ${esc(p.bedrooms || 0)}</li>
      <li>Bathrooms: ${esc(p.bathrooms || 0)}</li>
      <li>Surface: ${esc(p.surface ? `${p.surface} m²` : '-')}</li>
    </ul>
    <p>${esc(p.description || '')}</p>
  </article>`;

const staticPages = [
  {
    path: '/',
    out: 'index.html',
    title: 'Riads & Beachfront Rentals in Asilah, Morocco',
    description: 'Discover handpicked riads, beachfront apartments and medina houses in Asilah, Morocco. Book seasonal rentals, view prices and contact us on WhatsApp.',
    body: '<h1>Asilah Real Estate</h1><p>Handpicked rentals and sales in Asilah, Morocco — authentic riads, beachfront apartments and charming medina houses.</p>',
  },
  {
    path: '/properties',
    out: 'properties/index.html',
    title: 'Properties for Rent & Sale in Asilah, Morocco',
    description: 'Browse apartments, villas, riads and medina houses for rent and sale in Asilah, Morocco. Filter by type, price, bedrooms and surface.',
    body: '<h1>Properties in Asilah</h1><p>Browse our curated collection of properties for rent and sale in Asilah, Morocco.</p>',
  },
  {
    path: '/about',
    out: 'about/index.html',
    title: 'About Us',
    description: 'Asilah Real Estate — a trusted agency in Asilah, Morocco since 2015. Your partner for buying, selling and renting properties on the Atlantic coast.',
    body: '<h1>About Asilah Real Estate</h1><p>Your trusted partner in Asilah\'s real estate market since 2015.</p>',
  },
  {
    path: '/contact',
    out: 'contact/index.html',
    title: 'Contact Us',
    description: 'Contact Asilah Real Estate in Asilah, Morocco. Call, email or message us on WhatsApp for help finding your perfect property.',
    body: '<h1>Contact Asilah Real Estate</h1><p>Get in touch to find your perfect property in Asilah.</p>',
  },
];

async function fetchAllProperties() {
  const properties = [];
  let page = 1;
  let lastPage = 1;

  do {
    const res = await fetch(`${API_BASE}/public/properties?per_page=100&page=${page}`);
    if (!res.ok) throw new Error(`API ${res.status} on page ${page}`);
    const data = await res.json();
    const items = data?.data ?? data?.properties ?? data?.items ?? [];
    properties.push(...items);
    lastPage = data?.meta?.last_page ?? data?.pagination?.last_page ?? page;
    page += 1;
  } while (page <= lastPage && lastPage > 1 && properties.length > 0);

  return properties;
}

async function main() {
  const template = await readFile(join(DIST, 'index.html'), 'utf8');

  for (const page of staticPages) {
    const html = renderPage(template, { ...page, image: DEFAULT_IMAGE });
    const outPath = join(DIST, page.out);
    await mkdir(dirname(outPath), { recursive: true });
    await writeFile(outPath, html);
    console.log(`prerendered ${page.path}`);
  }

  let properties = [];
  try {
    properties = await fetchAllProperties();
  } catch (err) {
    console.warn(`\n[prerender] Could not fetch properties from ${API_BASE} (${err.message}).\nProperty pages were skipped — start the API and rebuild to include them.`);
  }

  for (const property of properties) {
    const outPath = join(DIST, 'properties', property.slug, 'index.html');
    const html = renderPage(template, {
      title: property.title,
      description: (property.description || `${property.title} in ${property.city || 'Asilah'}, Morocco`).slice(0, 160),
      path: `/properties/${property.slug}`,
      image: property.cover || DEFAULT_IMAGE,
      jsonLd: jsonLdFor(property),
      body: propertyBody(property),
    });
    await mkdir(dirname(outPath), { recursive: true });
    await writeFile(outPath, html);
    console.log(`prerendered /properties/${property.slug}`);
  }

  console.log(`\n[prerender] Done. ${properties.length} property page(s), canonical origin: ${ORIGIN}`);
}

main().catch((err) => {
  console.error('[prerender] Fatal error:', err);
  process.exit(1);
});
