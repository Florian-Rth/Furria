import type { CountAt, MusicSegment } from '../models/music-timeline';
import { countAt } from '../models/music-timeline';

export interface TimeReadout {
  time: string;
  count: CountAt | null;
}

const TENTHS_PER_SECOND = 10;
const SECONDS_PER_MINUTE = 60;

export const formatReadoutTime = (seconds: number): string => {
  const tenths = Math.round(Math.max(seconds, 0) * TENTHS_PER_SECOND);
  const wholeSeconds = Math.floor(tenths / TENTHS_PER_SECOND);
  const minutes = Math.floor(wholeSeconds / SECONDS_PER_MINUTE);
  const rest = String(wholeSeconds % SECONDS_PER_MINUTE).padStart(2, '0');

  return `${minutes}:${rest},${tenths % TENTHS_PER_SECOND}`;
};

export const formatReadoutMetres = (metres: number): string =>
  `${Math.abs(metres).toFixed(1).replace('.', ',')} m`;

export const timeReadoutOf = (segments: readonly MusicSegment[], seconds: number): TimeReadout => ({
  time: formatReadoutTime(seconds),
  count: countAt(segments, seconds),
});
