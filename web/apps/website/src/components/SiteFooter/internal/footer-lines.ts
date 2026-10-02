const CARNIVAL_CALL = 'Gross - Furria!';

export const buildClubLine = (name: string | null, foundedYear: number | null): string => {
  const celebration =
    foundedYear === null ? CARNIVAL_CALL : `Großfurra feiert seit ${foundedYear}. ${CARNIVAL_CALL}`;

  return name === null ? celebration : `${name} · ${celebration}`;
};

export const buildCopyrightLine = (name: string | null, year: number): string =>
  name === null ? `© ${year}` : `© ${year} ${name}`;
