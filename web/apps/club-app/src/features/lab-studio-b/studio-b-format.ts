import type { TimelineRange } from '@/features/act-player/music-timeline';

const SECONDS_PER_MINUTE = 60;
const TENTHS = 10;
const HALVES = 2;
const PAD = 2;

const split = (seconds: number): { minutes: number; rest: number } => {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / SECONDS_PER_MINUTE);

  return { minutes, rest: safe - minutes * SECONDS_PER_MINUTE };
};

export const clockOf = (seconds: number): string => {
  const whole = Math.floor(Math.max(0, seconds));
  const { minutes, rest } = split(whole);

  return `${minutes}:${String(rest).padStart(PAD, '0')}`;
};

export const preciseClockOf = (seconds: number): string => {
  const tenths = Math.floor(Math.max(0, seconds) * TENTHS + 1e-6);
  const { minutes, rest } = split(Math.floor(tenths / TENTHS));

  return `${minutes}:${String(rest).padStart(PAD, '0')},${tenths % TENTHS}`;
};

export const rangeClockOf = (range: TimelineRange): string =>
  `${clockOf(range.start)}–${clockOf(range.end)}`;

export const preciseRangeClockOf = (range: TimelineRange): string =>
  `${preciseClockOf(range.start)}–${preciseClockOf(range.end)}`;

export const eightsOf = (eights: number): string => {
  const halves = Math.round(eights * HALVES);
  const whole = Math.floor(halves / HALVES);
  const half = halves % HALVES === 1;

  if (whole === 0 && half) {
    return '½×8';
  }

  return `${whole}${half ? '½' : ''}×8`;
};

export const percentOf = (rate: number): string => `${Math.round(rate * 100)} %`;
