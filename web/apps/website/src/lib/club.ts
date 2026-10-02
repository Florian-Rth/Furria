export const SESSION_OPENING_MONTH = 11;
export const SESSION_OPENING_DAY = 11;

export const CLUB_CONTACT_EMAIL = 'contact@florianrth.com';

export interface Session {
  startYear: number;
  yearsLabel: string;
}

export const sessionAt = (date: Date): Session => {
  const month = date.getMonth() + 1;
  const openingHasPassed =
    month > SESSION_OPENING_MONTH ||
    (month === SESSION_OPENING_MONTH && date.getDate() >= SESSION_OPENING_DAY);
  const startYear = openingHasPassed ? date.getFullYear() : date.getFullYear() - 1;
  const endYearShort = String((startYear + 1) % 100).padStart(2, '0');
  return {
    startYear,
    yearsLabel: `${startYear}/${endYearShort}`,
  };
};

export const currentYear: number = new Date().getFullYear();
