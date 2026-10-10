import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { KkButton } from '../KkButton';
import { KkIcon } from '../KkIcon';
import type { KkBannerDeskActions, KkBannerDeskLabels } from './banner-desk-types';
import { KkBannerPanel } from './KkBannerPanel';

interface KkBannerEmptyActionsProps {
  labels: KkBannerDeskLabels;
  actions: KkBannerDeskActions;
}

export const KkBannerEmptyActions: FC<KkBannerEmptyActionsProps> = ({ labels, actions }) => (
  <KkBannerPanel>
    <Stack sx={{ gap: 0.75, py: 0.5, alignItems: 'center' }}>
      <Typography
        variant="caption"
        sx={{ px: 1, fontWeight: 600, color: 'text.secondary', textAlign: 'center' }}
      >
        {labels.emptyNote}
      </Typography>
      <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
        <KkButton
          variant="contained"
          size="small"
          startIcon={<KkIcon name="upload" size="small" />}
          onClick={actions.onUpload}
        >
          {labels.upload}
        </KkButton>
        <KkButton
          variant="outlined"
          size="small"
          startIcon={<KkIcon name="gallery" size="small" />}
          onClick={actions.onGallery}
        >
          {labels.gallery}
        </KkButton>
      </Stack>
    </Stack>
  </KkBannerPanel>
);
