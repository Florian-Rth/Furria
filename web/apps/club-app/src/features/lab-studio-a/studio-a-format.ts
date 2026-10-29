const SECONDS_PER_MINUTE = 60;
const TENTHS = 10;
const PERCENT = 100;

const pad = (value: number): string => String(value).padStart(2, '0');

export const minuteOf = (seconds: number): string => {
  const whole = Math.max(0, Math.floor(seconds));

  return `${Math.floor(whole / SECONDS_PER_MINUTE)}:${pad(whole % SECONDS_PER_MINUTE)}`;
};

export const clockOf = (seconds: number): string => {
  const tenths = Math.max(0, Math.floor(seconds * TENTHS));

  return `${minuteOf(Math.floor(tenths / TENTHS))},${tenths % TENTHS}`;
};

export const spanOf = (start: number | null, end: number | null): string | null =>
  start === null || end === null ? null : `${minuteOf(start)}–${minuteOf(end)}`;

export const percentOf = (rate: number): string => `${Math.round(rate * PERCENT)} %`;

export const shareOf = (seconds: number, length: number): number =>
  length <= 0 ? 0 : Math.min(1, Math.max(0, seconds / length));
