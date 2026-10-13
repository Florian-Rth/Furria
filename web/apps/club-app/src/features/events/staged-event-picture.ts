import type { KkBannerState, KkCrop } from '@furria/ui';

export interface StagedPictureSource {
  source: string;
  file: File | null;
  galleryItemId: number | null;
}

export interface StagedEventPicture extends StagedPictureSource {
  crop: KkCrop | null;
  draft: KkCrop | null;
  isCropping: boolean;
}

export interface StagedPictureBanner {
  state: KkBannerState;
  uncroppedSource: string | null;
  crop: KkCrop | null;
  preview: { source: string; crop: KkCrop } | null;
}

const EMPTY_BANNER: StagedPictureBanner = {
  state: 'empty',
  uncroppedSource: null,
  crop: null,
  preview: null,
};

export const toStagedPictureBanner = (staged: StagedEventPicture | null): StagedPictureBanner => {
  if (staged === null) {
    return EMPTY_BANNER;
  }
  if (staged.isCropping || staged.crop === null) {
    return { state: 'cropping', uncroppedSource: staged.source, crop: staged.draft, preview: null };
  }

  return {
    state: 'ready',
    uncroppedSource: staged.source,
    crop: staged.crop,
    preview: { source: staged.source, crop: staged.crop },
  };
};
