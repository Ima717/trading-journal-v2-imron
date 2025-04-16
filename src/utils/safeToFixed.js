export const safeToFixed = (val, digits = 2, fallback = '0.00') => {
  const num = Number(val);
  return isNaN(num) ? fallback : num.toFixed(digits);
};
