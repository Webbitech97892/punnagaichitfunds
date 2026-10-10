/**
 * Utility functions for date formatting across the application.
 * All UI display dates strictly use DD-MM-YYYY format.
 */

/**
 * Formats any date input (Date object, ISO string, YYYY-MM-DD, DD/MM/YYYY, timestamp)
 * into standard DD-MM-YYYY (e.g. 03-09-2026).
 */
export const formatDateDMY = (dateInput?: Date | string | number | null): string => {
  if (!dateInput && dateInput !== 0) {
    return '';
  }

  try {
    if (dateInput instanceof Date) {
      if (isNaN(dateInput.getTime())) return '';
      const day = String(dateInput.getDate()).padStart(2, '0');
      const month = String(dateInput.getMonth() + 1).padStart(2, '0');
      const year = dateInput.getFullYear();
      return `${day}-${month}-${year}`;
    }

    const str = String(dateInput).trim();
    if (!str || str.toLowerCase() === 'null' || str.toLowerCase() === 'undefined' || str === '-') {
      return '';
    }

    // Match YYYY-MM-DD or YYYY/MM/DD or YYYY.MM.DD (with optional time component)
    const ymdMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
    if (ymdMatch) {
      const year = ymdMatch[1];
      const month = ymdMatch[2].padStart(2, '0');
      const day = ymdMatch[3].padStart(2, '0');
      return `${day}-${month}-${year}`;
    }

    // Match DD-MM-YYYY or DD/MM/YYYY or DD.MM.YYYY (with optional time component)
    const dmyMatch = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
    if (dmyMatch) {
      const day = dmyMatch[1].padStart(2, '0');
      const month = dmyMatch[2].padStart(2, '0');
      const year = dmyMatch[3];
      return `${day}-${month}-${year}`;
    }

    // Try numeric timestamp
    if (/^\d+$/.test(str)) {
      const num = Number(str);
      const timestamp = str.length === 10 ? num * 1000 : num;
      const d = new Date(timestamp);
      if (!isNaN(d.getTime())) {
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
      }
    }

    // Fallback standard JS Date parse
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      const day = String(parsed.getDate()).padStart(2, '0');
      const month = String(parsed.getMonth() + 1).padStart(2, '0');
      const year = parsed.getFullYear();
      return `${day}-${month}-${year}`;
    }
  } catch (e) {
    // fallback
  }

  return String(dateInput);
};

/**
 * Formats a date into YYYY-MM-DD for backend API payloads.
 */
export const formatDateYMD = (date: Date | string | number): string => {
  if (!date && date !== 0) {
    return '';
  }
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return String(date);
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTodayYMD = (): string => {
  return formatDateYMD(new Date());
};

export const getTodayDMY = (): string => {
  return formatDateDMY(new Date());
};

export const getDisplayToday = (): string => {
  return formatDateDMY(new Date());
};

export const formatDisplayDate = (date: Date): string => {
  return formatDateDMY(date);
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};


