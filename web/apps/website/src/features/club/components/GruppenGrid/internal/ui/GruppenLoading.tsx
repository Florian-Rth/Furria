import { KkLead } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { groupsLabels } from '@/features/club/groups-content';
import { GruppenTileGrid } from '../layout/GruppenTileGrid';
import { GruppenTileSkeleton } from './GruppenTileSkeleton';

const SKELETON_KEYS = [
  'gruppen-skeleton-1',
  'gruppen-skeleton-2',
  'gruppen-skeleton-3',
  'gruppen-skeleton-4',
  'gruppen-skeleton-5',
  'gruppen-skeleton-6',
];

export const GruppenLoading: FC = () => (
  <Stack role="status" sx={{ gap: { xs: 3, md: 4 } }}>
    <KkLead>{groupsLabels.loading}</KkLead>
    <GruppenTileGrid>
      {SKELETON_KEYS.map((key) => (
        <GruppenTileSkeleton key={key} />
      ))}
    </GruppenTileGrid>
  </Stack>
);
