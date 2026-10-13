import type { KkBannerState, KkCrop } from '@furria/ui';
import type { PictureEditing } from '@/lib/api/schemas';
import type { PictureDeskState } from '@/lib/media/picture-desk';

export interface PictureBanner {
  state: KkBannerState;
  source: string | null;
  uncroppedSource: string | null;
  crop: KkCrop | null;
  progress: number;
}

const LOCAL_BANNER = { source: null, uncroppedSource: null, crop: null } as const;

const storedStateOf = (editing: PictureEditing, desk: PictureDeskState): KkBannerState => {
  if (editing.state === 'failed') {
    return 'failed';
  }
  if (editing.state === 'processing' || editing.picture === null) {
    return 'developing';
  }

  return desk.kind === 'cropping' && editing.uncroppedUrl !== null ? 'cropping' : 'ready';
};

export const toPictureBanner = (
  editing: PictureEditing | null,
  desk: PictureDeskState,
): PictureBanner => {
  if (desk.kind === 'uploading') {
    return { ...LOCAL_BANNER, state: 'uploading', progress: desk.share };
  }
  if (desk.kind === 'failed') {
    return { ...LOCAL_BANNER, state: 'failed', progress: 0 };
  }
  if (editing === null) {
    return { ...LOCAL_BANNER, state: 'empty', progress: 0 };
  }

  return {
    state: storedStateOf(editing, desk),
    source: editing.picture?.mediumUrl ?? null,
    uncroppedSource: editing.uncroppedUrl,
    crop: editing.crop,
    progress: 1,
  };
};
