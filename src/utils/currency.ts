export const formatCurrency = (amount?: string | number | null, showSymbol = true): string => {
  if (amount === undefined || amount === null || amount === '') {
    return showSymbol ? '₹0' : '0';
  }

  const num = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.-]+/g, '')) : amount;
  if (isNaN(num)) {
    return showSymbol ? `₹${amount}` : `${amount}`;
  }

  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(num);

  return showSymbol ? `₹${formatted}` : formatted;
};

export const parseAmount = (val?: string | number | null): number => {
  if (!val) {
    return 0;
  }
  const cleaned = String(val).replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
};
