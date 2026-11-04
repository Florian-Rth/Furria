const BASE_NAME = 'Saal';

export const nextHallName = (taken: readonly string[]): string => {
  const names = new Set(taken.map((name) => name.trim().toLocaleLowerCase('de-DE')));
  if (!names.has(BASE_NAME.toLocaleLowerCase('de-DE'))) {
    return BASE_NAME;
  }
  let counter = 2;
  while (names.has(`${BASE_NAME} ${counter}`.toLocaleLowerCase('de-DE'))) {
    counter += 1;
  }

  return `${BASE_NAME} ${counter}`;
};
