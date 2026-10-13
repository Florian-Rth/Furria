export type KkFillCap = 'calm' | 'low' | 'critical';

export interface FillGaugeShares {
  parts: number[];
  other: number;
  free: number;
  cap: KkFillCap;
}

const LOW_SHARE = 0.15;
const CRITICAL_SHARE = 0.05;

const clampShare = (share: number): number => Math.min(Math.max(share, 0), 1);

const sumOf = (values: readonly number[]): number =>
  values.reduce((total, value) => total + value, 0);

const capOf = (free: number): KkFillCap => {
  if (free < CRITICAL_SHARE) {
    return 'critical';
  }
  if (free < LOW_SHARE) {
    return 'low';
  }

  return 'calm';
};

const surveyOnly = (partBytes: readonly number[]): FillGaugeShares => {
  const surveyed = sumOf(partBytes);
  const parts = partBytes.map((bytes) => (surveyed > 0 ? bytes / surveyed : 0));

  return { parts, other: 0, free: 0, cap: 'calm' };
};

export const fillGaugeSharesOf = (
  partBytes: readonly number[],
  freeBytes: number | null,
  totalBytes: number | null,
): FillGaugeShares => {
  if (freeBytes === null || totalBytes === null || totalBytes <= 0) {
    return surveyOnly(partBytes);
  }

  const free = clampShare(freeBytes / totalBytes);
  const used = 1 - free;
  const surveyed = sumOf(partBytes) / totalBytes;
  const scale = surveyed > used && surveyed > 0 ? used / surveyed : 1;
  const parts = partBytes.map((bytes) => (bytes / totalBytes) * scale);
  const other = Math.max(used - sumOf(parts), 0);

  return { parts, other, free, cap: capOf(free) };
};
