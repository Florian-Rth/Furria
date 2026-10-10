import type { KkSx } from '@furria/ui';
import type { NewsVersion, NewsVersionPart } from '../../types';

export interface NewsProofsProps {
  version: NewsVersion;
  publishedAt: string | null;
  changedParts: readonly NewsVersionPart[];
  liveKey: number;
  sx?: KkSx;
}
