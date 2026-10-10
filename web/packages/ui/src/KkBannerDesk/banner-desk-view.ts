import type { KkBannerState } from './banner-desk-types';

const PERCENT = 100;

export interface KkBannerSources {
  source: string | null;
  uncroppedSource: string | null;
}

export const bannerSourceOf = (
  state: KkBannerState,
  { source, uncroppedSource }: KkBannerSources,
): string | null => {
  if (state === 'ready' || state === 'cropping') {
    return source;
  }
  return state === 'developing' ? uncroppedSource : null;
};

export const isBannerEditable = (state: KkBannerState): boolean =>
  state === 'ready' || state === 'cropping';

export const uploadPercentOf = (progress: number): number => Math.round(progress * PERCENT);
