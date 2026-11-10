const pad = (value: number): string => String(value).padStart(2, '0');

export const toIsoDay = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

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
