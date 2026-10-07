const pad = (value: number): string => String(value).padStart(2, '0');

export const toIsoDay = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const fromIsoDay = (isoDay: string): Date => new Date(`${isoDay}T00:00:00`);

export const isFutureDay = (isoDay: string, todayIsoDay: string): boolean => isoDay > todayIsoDay;
