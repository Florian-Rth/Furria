import type { KkCrop } from '@furria/ui';
import type { GalleryPhoto } from './schemas';

export const BANNER_ASPECT = 2;

const WHOLE: KkCrop = { left: 0, top: 0, width: 1, height: 1 };

export const centredBannerCropOf = (width: number | null, height: number | null): KkCrop => {
  if (width === null || height === null || width <= 0 || height <= 0) {
    return WHOLE;
  }
  const ratio = width / height;
  if (ratio > BANNER_ASPECT) {
    const share = BANNER_ASPECT / ratio;
    return { left: (1 - share) / 2, top: 0, width: share, height: 1 };
  }
  const share = ratio / BANNER_ASPECT;
  return { left: 0, top: (1 - share) / 2, width: 1, height: share };
};

export const isPickablePhoto = (item: GalleryPhoto): boolean =>
  item.kind === 'photo' && item.state === 'ready';

export const newsUploadOwnerOf = (newsPostId: number): string => `news:${newsPostId}`;
