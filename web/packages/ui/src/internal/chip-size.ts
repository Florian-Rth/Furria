export type KkChipSize = 'small' | 'medium';

export interface KkChipMetrics {
  px: number;
  py: number;
}

export const chipSizeMetrics: Record<KkChipSize, KkChipMetrics> = {
  medium: { px: 1.125, py: 0.5 },
  small: { px: 1, py: 0.375 },
};
