import type { NewsContentPayload } from './requests';
import type { NewsFields } from './types';

const RETRY_DELAYS_MS = [3_000, 6_000, 12_000, 24_000, 48_000] as const;

export class SaveFailedError extends Error {}

export const contentPayloadOf = (fields: NewsFields): NewsContentPayload => ({
  ...fields,
  pictureCaption: fields.pictureCaption.trim().length === 0 ? null : fields.pictureCaption,
});

export const isRestorableSave = (
  sequence: number,
  newestSequence: number,
  hasNewerPending: boolean,
): boolean => !hasNewerPending && sequence === newestSequence;

export const nextRetryDelayOf = (retriesSoFar: number): number | null =>
  RETRY_DELAYS_MS[retriesSoFar] ?? null;

export const latestMomentOf = (left: string | null, right: string | null): string | null => {
  if (left === null || right === null) {
    return left ?? right;
  }
  return Date.parse(left) >= Date.parse(right) ? left : right;
};
