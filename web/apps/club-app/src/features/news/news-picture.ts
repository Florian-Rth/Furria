import type { PictureDeskState } from '@/lib/media/picture-desk';
import type { NewsPicture } from './types';

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
