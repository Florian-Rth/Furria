import { kkTokens } from '../tokens';

export type KkChipSize = 'small' | 'medium';

export interface KkChipMetrics {
  fontSize: string;
  px: number;
  py: number;
}

export const chipSizeMetrics: Record<KkChipSize, KkChipMetrics> = {
  medium: { fontSize: kkTokens.type.chip, px: 1.125, py: 0.5 },
  small: { fontSize: kkTokens.type.chipSmall, px: 1, py: 0.375 },
};
