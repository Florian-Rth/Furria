import type { KkCrop } from '../crop-frame';
import type { KkCropFrameLabels } from '../KkCropFrame/KkCropFrame';

export type KkBannerState = 'empty' | 'uploading' | 'developing' | 'failed' | 'ready' | 'cropping';

export interface KkBannerDeskLabels {
  upload: string;
  gallery: string;
  emptyNote: string;
  replace: string;
  uploading: string;
  developing: string;
  failed: string;
  retry: string;
  crop: string;
  cropHint: string;
  cropDone: string;
  cropCancel: string;
  remove: string;
  removeConfirm: string;
  cropFrame: KkCropFrameLabels;
}

export interface KkBannerDeskActions {
  onUpload: () => void;
  onGallery: () => void;
  onRetry: () => void;
  onCrop: () => void;
  onCropDone: () => void;
  onCropCancel: () => void;
  onRemove: () => void;
  onCropChange: (crop: KkCrop) => void;
}
