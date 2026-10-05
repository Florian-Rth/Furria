export const buildFoundingLabel = (foundedYear: number | null): string =>
  foundedYear === null ? 'GROSSFURRA' : `GROSSFURRA · EST. ${foundedYear}`;

export const buildSessionLabel = (sessionLabel: string | null): string =>
  sessionLabel === null ? '' : `SESSION ${sessionLabel}`;
