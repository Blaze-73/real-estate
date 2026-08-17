import i18n from '../i18n';

const formatDate = (value, fallback = '—') => {
  if (!value) return fallback;
  let date;
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    const [y, m, d] = value.slice(0, 10).split('-').map(Number);
    date = new Date(Date.UTC(y, m - 1, d));
  } else {
    date = new Date(value);
  }
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString(i18n.language || 'en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
};

export default formatDate;
