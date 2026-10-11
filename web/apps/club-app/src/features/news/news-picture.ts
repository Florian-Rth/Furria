import type { KkCrop } from '@furria/ui';
import type { PictureDeskState } from '@/lib/media/picture-desk';
import type { GalleryPhoto } from './schemas';
import type { NewsPicture } from './types';

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

const UPLOAD_KEY_PREFIX = 'upload:';

export const uploadOverlayOf = (state: PictureDeskState): NewsPicture | null =>
  state.kind === 'uploading' || state.kind === 'failed'
    ? {
        key: `${UPLOAD_KEY_PREFIX}${state.photo.file.name}:${state.photo.file.lastModified}`,
        state: state.kind,
        progress: state.kind === 'uploading' ? state.share : 0,
        uncroppedSource: null,
        source: null,
        crop: null,
      }
    : null;
