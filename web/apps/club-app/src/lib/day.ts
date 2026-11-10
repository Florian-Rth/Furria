const pad = (value: number): string => String(value).padStart(2, '0');

export const toIsoDay = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const MS_PER_DAY = 86_400_000;

export const isoDayPartsOf = (isoDay: string): [number, number, number] => [
  Number(isoDay.slice(0, 4)),
  Number(isoDay.slice(5, 7)) - 1,
  Number(isoDay.slice(8, 10)),
];

export const shiftDay = (isoDay: string, days: number): string => {
  const [year, month, day] = isoDayPartsOf(isoDay);

  return toIsoDay(new Date(year, month, day + days));
};

export const daysBetween = (from: string, to: string): number =>
  Math.round((Date.UTC(...isoDayPartsOf(to)) - Date.UTC(...isoDayPartsOf(from))) / MS_PER_DAY);

export const fromIsoDay = (isoDay: string): Date => new Date(`${isoDay}T00:00:00`);

export const isFutureDay = (isoDay: string, todayIsoDay: string): boolean => isoDay > todayIsoDay;

export interface DayTime {
  day: string;
  time: string;
}

export const toInstant = (isoDay: string, time: string): string =>
  new Date(
    Number(isoDay.slice(0, 4)),
    Number(isoDay.slice(5, 7)) - 1,
    Number(isoDay.slice(8, 10)),
    Number(time.slice(0, 2)),
    Number(time.slice(3, 5)),
  ).toISOString();

export const toDayTime = (isoInstant: string): DayTime => {
  const moment = new Date(isoInstant);

  return { day: toIsoDay(moment), time: `${pad(moment.getHours())}:${pad(moment.getMinutes())}` };
};
