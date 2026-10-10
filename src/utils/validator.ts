export const validateMobile = (mobile?: string | number | null): boolean => {
  const cleaned = String(mobile || '').replace(/\D/g, '');
  return cleaned.length === 10;
};

export const validateRequired = (val?: string | number | null): boolean => {
  return val !== undefined && val !== null && String(val).trim().length > 0;
};

export const validatePositiveAmount = (amount?: string | number | null): boolean => {
  const num = parseFloat(String(amount || ''));
  return !isNaN(num) && num > 0;
};
