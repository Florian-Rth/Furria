export const FOUNDING_YEAR = 1971;

export const SESSION_OPENING_MONTH = 11;
export const SESSION_OPENING_DAY = 11;

export const MEMBER_COUNT_PLACEHOLDER = '180+';
export const GROUP_COUNT_PLACEHOLDER = 12;

export interface Session {
  number: number;
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
    number: startYear - FOUNDING_YEAR + 1,
    startYear,
    yearsLabel: `${startYear}/${endYearShort}`,
  };
};

export const currentSession: Session = sessionAt(new Date());

export const currentYear: number = new Date().getFullYear();
