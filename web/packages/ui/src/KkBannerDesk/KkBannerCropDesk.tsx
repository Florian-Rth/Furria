import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkCrop } from '../crop-frame';
import { KkButton } from '../KkButton';
import { KkCropFrame } from '../KkCropFrame/KkCropFrame';
import { KkIcon } from '../KkIcon';
import { kkTokens } from '../tokens';
import type { KkBannerDeskActions, KkBannerDeskLabels } from './banner-desk-types';

const BANNER_ASPECT = 2;

interface KkBannerCropDeskProps {
  id: string;
  source: string;
  alt: string;
  crop: KkCrop | null;
  labels: KkBannerDeskLabels;
  actions: KkBannerDeskActions;
}

export const KkBannerCropDesk: FC<KkBannerCropDeskProps> = ({
  id,
  source,
  alt,
  crop,
  labels,
  actions,
}) => (
  <Stack id={id} data-kk-banner-desk="cropping" sx={{ gap: 0.5 }}>
    <Box sx={{ position: 'relative' }}>
      <KkCropFrame
        source={source}
        alt={alt}
        aspect={BANNER_ASPECT}
        initialCrop={crop}
        labels={labels.cropFrame}
        onCropChange={actions.onCropChange}
      />
      <Stack
        direction="row"
        aria-hidden
        sx={{
          position: 'absolute',
          top: (theme) => theme.spacing(1),
          left: (theme) => theme.spacing(1),
          gap: 0.5,
          px: 1,
          py: 0.25,
          alignItems: 'center',
          borderRadius: 3,
          pointerEvents: 'none',
          color: kkTokens.overlay.onPhotoText,
          bgcolor: kkTokens.crop.veil,
        }}
      >
        <KkIcon name="drag" size="small" />
        <Typography variant="caption" sx={{ fontWeight: 700 }}>
          {labels.cropHint}
        </Typography>
      </Stack>
    </Box>
    <Stack direction="row" sx={{ gap: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
      <KkButton variant="text" size="small" onClick={actions.onCropCancel}>
        {labels.cropCancel}
      </KkButton>
      <KkButton
        variant="contained"
        size="small"
        startIcon={<KkIcon name="check" size="small" />}
        onClick={actions.onCropDone}
      >
        {labels.cropDone}
      </KkButton>
    </Stack>
  </Stack>
);
