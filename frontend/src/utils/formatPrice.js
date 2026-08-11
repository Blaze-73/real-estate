const formatPrice = (price, fallback = 'Contact') => {
  const value = Number(price);
  return Number.isFinite(value) && value > 0
    ? `${value.toLocaleString()} MAD`
    : fallback;
};

export default formatPrice;