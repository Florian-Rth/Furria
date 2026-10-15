import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import type { FC } from 'react';
import type { KkAspect } from '../image-aspect';
import { aspectRatioCss } from '../image-aspect';
import type { KkCrop } from '../image-crop';
import type { KkGroupTone } from '../internal/group-tone';
import { KkPhotoStamp } from '../internal/KkPhotoStamp';
import type { KkCropGuide } from '../KkCropFrame/KkCropFrame';
import { KkCropPreview } from '../KkCropPreview';
import { KkPhoto } from '../KkPhoto';
import { kkTokens } from '../tokens';
import type { KkBannerDeskActions, KkBannerDeskLabels, KkBannerState } from './banner-desk-types';
import {
  bannerSourceOf,
  isBannerEditable,
  isBannerStamped,
  uploadPercentOf,
} from './banner-desk-view';
import { KkBannerCropDesk } from './KkBannerCropDesk';
import { KkBannerEmptyActions } from './KkBannerEmptyActions';
import { KkBannerOverlay } from './KkBannerOverlay';
import { KkBannerStatusLine } from './KkBannerStatusLine';
import { KkBannerToolbar } from './KkBannerToolbar';
import { KkBannerTrouble } from './KkBannerTrouble';

export interface KkBannerPreview {
  source: string;
  crop: KkCrop;
}

interface KkBannerDeskProps {
  id: string;
  aspect?: KkAspect;
  guide?: KkCropGuide;
  state: KkBannerState;
  placeholderLabel?: string;
  tone?: KkGroupTone;
  preview?: KkBannerPreview | null;
  stampLabel?: string | null;
  source: string | null;
  uncroppedSource: string | null;
  crop: KkCrop | null;
  progress: number;
  alt: string;
  readOnly: boolean;
  labels: KkBannerDeskLabels;
  actions: KkBannerDeskActions;
}

export const KkBannerDesk: FC<KkBannerDeskProps> = ({
  id,
  aspect = 'banner',
  guide = 'none',
  state,
  placeholderLabel,
  tone,
  preview = null,
  stampLabel = null,
  source,
  uncroppedSource,
  crop,
  progress,
  alt,
  readOnly,
  labels,
  actions,
}) => {
  if (state === 'cropping' && uncroppedSource !== null) {
    return (
      <KkBannerCropDesk
        id={id}
        aspect={aspect}
        guide={guide}
        source={uncroppedSource}
        alt={alt}
        crop={crop}
        labels={labels}
        actions={actions}
      />
    );
  }

  const shownSource = bannerSourceOf(state, { source, uncroppedSource });
  const percent = uploadPercentOf(progress);
  const uploadLine = `${labels.uploading} · ${percent} %`;
  const shownImage = shownSource === null ? null : { src: shownSource };
  const photo = (
    <KkPhoto
      alt={alt}
      image={shownImage}
      placeholderLabel={placeholderLabel}
      tone={tone}
      fill
      sx={(theme) => ({
        borderRadius: `${kkTokens.radius.base}px`,
        filter:
          state === 'developing' || state === 'stalled' ? kkTokens.banner.developingFilter : 'none',
        transition: theme.transitions.create('filter', {
          duration: kkTokens.banner.revealMs,
          easing: theme.transitions.easing.easeOut,
        }),
      })}
    />
  );
  const media =
    preview === null || shownSource !== null ? (
      photo
    ) : (
      <KkCropPreview source={preview.source} crop={preview.crop} />
    );

  const stamp =
    stampLabel !== null && isBannerStamped(state, readOnly) ? (
      <KkPhotoStamp label={stampLabel} scale="card" />
    ) : null;

  const emptyActions =
    state === 'empty' && !readOnly ? (
      <KkBannerOverlay placement="upper">
        <KkBannerEmptyActions labels={labels} actions={actions} />
      </KkBannerOverlay>
    ) : null;

  const readyActions =
    isBannerEditable(state) && !readOnly ? (
      <KkBannerOverlay placement="corner">
        <KkBannerToolbar labels={labels} actions={actions} />
      </KkBannerOverlay>
    ) : null;

  const uploadStatus =
    state === 'uploading' ? (
      <KkBannerOverlay placement="foot">
        <KkBannerStatusLine text={uploadLine} />
        <LinearProgress variant="determinate" value={percent} sx={{ borderRadius: 2 }} />
      </KkBannerOverlay>
    ) : null;

  const developStatus =
    state === 'developing' ? (
      <KkBannerOverlay placement="foot">
        <KkBannerStatusLine text={labels.developing} />
        <LinearProgress sx={{ borderRadius: 2 }} />
      </KkBannerOverlay>
    ) : null;

  const isFailed = state === 'failed';
  const isTroubled = isFailed || state === 'stalled';
  const troubleMessage = isFailed ? labels.failed : labels.stalled;
  const troubleTone = isFailed ? 'error' : 'warning';
  const troubleStatus =
    isTroubled && !readOnly ? (
      <KkBannerOverlay placement="center">
        <KkBannerTrouble
          message={troubleMessage}
          tone={troubleTone}
          retry={labels.retry}
          remove={labels.remove}
          onRetry={actions.onRetry}
          onRemove={actions.onRemove}
        />
      </KkBannerOverlay>
    ) : null;

  return (
    <Box
      id={id}
      data-kk-banner-desk={state}
      sx={{
        position: 'relative',
        width: '100%',
        aspectRatio: aspectRatioCss(aspect),
        borderRadius: `${kkTokens.radius.base}px`,
        border: 1,
        borderColor: 'divider',
        typography: { xs: 'h1', md: 'display' },
      }}
    >
      {media}
      {stamp}
      {emptyActions}
      {readyActions}
      {uploadStatus}
      {developStatus}
      {troubleStatus}
    </Box>
  );
};
