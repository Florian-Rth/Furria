import type { KkSize } from '@furria/ui';
import type { PictureDeskState } from '@/lib/media/picture-desk';
import type { GalleryPhoto } from './schemas';
import type { NewsPicture } from './types';

export const photoSizeOf = ({ width, height }: GalleryPhoto): KkSize | null =>
  width === null || height === null ? null : { width, height };

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
