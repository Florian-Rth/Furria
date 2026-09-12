import { KkCard, KkSkeletonBlock } from '@furria/ui';
import Box from '@mui/material/Box';
import type { FC } from 'react';

const BODY_LINES = 4;

export const GruppenTileSkeleton: FC = () => (
  <KkCard>
    <KkCard.Media>
      <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'action.hover' }} />
    </KkCard.Media>
    <KkCard.Body>
      <KkSkeletonBlock lines={BODY_LINES} sx={{ width: '100%' }} />
    </KkCard.Body>
  </KkCard>
);
