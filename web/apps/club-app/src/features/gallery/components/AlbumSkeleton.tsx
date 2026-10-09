import { KkFrame, KkFrameGrid, KkSkeletonBlock } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';

const PLACEHOLDER_FRAMES = Array.from({ length: 24 }, (_, index) => `album-skeleton-${index}`);
const LOADING_LABEL = 'Album lädt';

export const AlbumSkeleton: FC = () => {
  const frames = PLACEHOLDER_FRAMES.map((key) => (
    <KkFrame key={key} label={LOADING_LABEL} state="processing" latentLabel="" />
  ));

  return (
    <Stack aria-busy sx={{ rowGap: 2.5, pb: 4 }}>
      <KkSkeletonBlock lines={2} />
      <KkFrameGrid label={LOADING_LABEL}>{frames}</KkFrameGrid>
    </Stack>
  );
};
