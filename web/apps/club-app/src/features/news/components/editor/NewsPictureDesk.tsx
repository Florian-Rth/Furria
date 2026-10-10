import type { KkBannerDeskActions, KkBannerDeskLabels, KkBannerState } from '@furria/ui';
import { KkBannerDesk, KkCaptionField, KkProofSheet } from '@furria/ui';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { PICTURE_ACCEPT } from '@/features/pictures';
import {
  CAPTION_LABEL,
  CAPTION_PLACEHOLDER,
  PICTURE_ALT,
  PICTURE_CROP,
  PICTURE_CROP_CANCEL,
  PICTURE_CROP_DONE,
  PICTURE_CROP_HINT,
  PICTURE_CROP_LABELS,
  PICTURE_DEVELOPING,
  PICTURE_EMPTY_NOTE,
  PICTURE_FAILED,
  PICTURE_FROM_GALLERY,
  PICTURE_REMOVE,
  PICTURE_REMOVE_CONFIRM,
  PICTURE_REPLACE,
  PICTURE_RETRY,
  PICTURE_UPLOAD,
  PICTURE_UPLOADING,
} from '../../editor-copy';
import type { NewsPictureDesk as PictureDesk } from '../../hooks/use-news-picture';
import { CATEGORY_LABELS, CATEGORY_TONES } from '../../news-copy';
import type { PartMark } from '../../part-marks';
import { POSTER_FALLBACK } from '../../proof-copy';
import type { NewsCategory } from '../../types';

const LABELS: KkBannerDeskLabels = {
  upload: PICTURE_UPLOAD,
  gallery: PICTURE_FROM_GALLERY,
  emptyNote: PICTURE_EMPTY_NOTE,
  replace: PICTURE_REPLACE,
  uploading: PICTURE_UPLOADING,
  developing: PICTURE_DEVELOPING,
  failed: PICTURE_FAILED,
  retry: PICTURE_RETRY,
  crop: PICTURE_CROP,
  cropHint: PICTURE_CROP_HINT,
  cropDone: PICTURE_CROP_DONE,
  cropCancel: PICTURE_CROP_CANCEL,
  remove: PICTURE_REMOVE,
  removeConfirm: PICTURE_REMOVE_CONFIRM,
  cropFrame: PICTURE_CROP_LABELS,
};

interface NewsPictureDeskProps {
  desk: PictureDesk;
  state: KkBannerState;
  category: NewsCategory | null;
  caption: string;
  pictureMark: PartMark;
  captionMark: PartMark;
  markLabel: string;
  isReadOnly: boolean;
  onCaptionChange: (caption: string) => void;
}

export const NewsPictureDesk: FC<NewsPictureDeskProps> = ({
  desk,
  state,
  category,
  caption,
  pictureMark,
  captionMark,
  markLabel,
  isReadOnly,
  onCaptionChange,
}) => {
  const { picture } = desk;
  const actions: KkBannerDeskActions = {
    onUpload: desk.chooseFile,
    onGallery: desk.openGallery,
    onRetry: desk.retry,
    onCrop: desk.startCrop,
    onCropDone: desk.finishCrop,
    onCropCancel: desk.cancelCrop,
    onRemove: desk.remove,
    onCropChange: desk.onCropChange,
  };
  const tone = category === null ? null : CATEGORY_TONES[category];
  const posterWord = category === null ? POSTER_FALLBACK : CATEGORY_LABELS[category];
  const hasNoCaption = picture === null || (isReadOnly && caption.trim().length === 0);
  const captionField = hasNoCaption ? null : (
    <KkProofSheet.Part mark={captionMark}>
      <KkProofSheet.MarkWord mark={captionMark} label={markLabel} />
      <KkCaptionField
        id="news-field-caption"
        label={CAPTION_LABEL}
        placeholder={CAPTION_PLACEHOLDER}
        value={caption}
        readOnly={isReadOnly}
        onChange={onCaptionChange}
      />
    </KkProofSheet.Part>
  );

  return (
    <Stack component="figure" sx={{ m: 0, gap: 1 }}>
      <KkProofSheet.Part mark={pictureMark}>
        <KkProofSheet.MarkWord mark={pictureMark} label={markLabel} />
        <KkBannerDesk
          id="news-field-picture"
          state={state}
          posterTone={tone}
          posterWord={posterWord}
          source={picture?.source ?? null}
          uncroppedSource={picture?.uncroppedSource ?? null}
          crop={picture?.crop ?? null}
          progress={picture?.progress ?? 0}
          alt={PICTURE_ALT}
          readOnly={isReadOnly}
          labels={LABELS}
          actions={actions}
        />
      </KkProofSheet.Part>
      {captionField}
      <Box
        component="input"
        type="file"
        accept={PICTURE_ACCEPT}
        ref={desk.fileInputRef}
        onChange={desk.onFileChosen}
        sx={{ display: 'none' }}
      />
    </Stack>
  );
};
