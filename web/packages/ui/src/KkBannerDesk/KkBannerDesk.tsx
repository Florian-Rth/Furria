import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkCrop } from '../crop-frame';
import { KkButton } from '../KkButton';
import { KkCoverPicture } from '../KkCoverPicture';
import { KkNewsPoster } from '../KkNewsPoster';
import type { KkNewsTone } from '../KkNewsProof/news-proof-types';
import { kkTokens } from '../tokens';
import type { KkBannerDeskActions, KkBannerDeskLabels, KkBannerState } from './banner-desk-types';
import { bannerSourceOf, isBannerEditable, uploadPercentOf } from './banner-desk-view';
import { KkBannerCropDesk } from './KkBannerCropDesk';
import { KkBannerEmptyActions } from './KkBannerEmptyActions';
import { KkBannerOverlay } from './KkBannerOverlay';
import { KkBannerPanel } from './KkBannerPanel';
import { KkBannerStatusLine } from './KkBannerStatusLine';
import { KkBannerToolbar } from './KkBannerToolbar';

interface KkBannerDeskProps {
  id: string;
  state: KkBannerState;
  posterTone: KkNewsTone | null;
  posterWord: string;
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
  state,
  posterTone,
  posterWord,
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
  const media =
    shownSource === null ? (
      <KkNewsPoster
        tone={posterTone}
        word={posterWord}
        sx={{ borderRadius: `${kkTokens.radius.base}px` }}
      />
    ) : (
      <KkCoverPicture
        source={shownSource}
        alt={alt}
        sx={(theme) => ({
          borderRadius: `${kkTokens.radius.base}px`,
          filter: state === 'developing' ? kkTokens.banner.developingFilter : 'none',
          transition: theme.transitions.create('filter', {
            duration: kkTokens.banner.revealMs,
            easing: theme.transitions.easing.easeOut,
          }),
        })}
      />
    );

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

  const failedStatus =
    state === 'failed' && !readOnly ? (
      <KkBannerOverlay placement="center">
        <KkBannerPanel>
          <Typography variant="caption" sx={{ px: 1, fontWeight: 800, color: 'error.main' }}>
            {labels.failed}
          </Typography>
          <KkButton variant="contained" size="small" onClick={actions.onRetry}>
            {labels.retry}
          </KkButton>
        </KkBannerPanel>
      </KkBannerOverlay>
    ) : null;

  return (
    <Box
      id={id}
      data-kk-banner-desk={state}
      sx={{
        position: 'relative',
        width: '100%',
        aspectRatio: kkTokens.aspectRatio.banner,
        borderRadius: `${kkTokens.radius.base}px`,
        border: 1,
        borderColor: 'divider',
        typography: { xs: 'h1', md: 'display' },
      }}
    >
      {media}
      {emptyActions}
      {readyActions}
      {uploadStatus}
      {developStatus}
      {failedStatus}
    </Box>
  );
};
