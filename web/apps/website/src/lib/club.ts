export const SESSION_OPENING_MONTH = 11;
export const SESSION_OPENING_DAY = 11;

export interface Session {
  startYear: number;
  yearsLabel: string;
}

export const sessionStartingIn = (startYear: number): Session => {
  const endYearShort = String((startYear + 1) % 100).padStart(2, '0');
  return {
    startYear,
    yearsLabel: `${startYear}/${endYearShort}`,
  };
};

export const sessionAt = (date: Date): Session => {
  const month = date.getMonth() + 1;
  const openingHasPassed =
    month > SESSION_OPENING_MONTH ||
    (month === SESSION_OPENING_MONTH && date.getDate() >= SESSION_OPENING_DAY);
  return sessionStartingIn(openingHasPassed ? date.getFullYear() : date.getFullYear() - 1);
};

export const currentYear: number = new Date().getFullYear();
