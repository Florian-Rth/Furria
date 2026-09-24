import { KkLead } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { groupsLabels } from '@/features/club/groups-content';
import { GroupTileGrid } from '../layout/GroupTileGrid';
import { GroupTileSkeleton } from './GroupTileSkeleton';

const SKELETON_KEYS = [
  'group-skeleton-1',
  'group-skeleton-2',
  'group-skeleton-3',
  'group-skeleton-4',
  'group-skeleton-5',
  'group-skeleton-6',
];

export const GroupsLoading: FC = () => (
  <Stack role="status" sx={{ gap: { xs: 3, md: 4 } }}>
    <KkLead>{groupsLabels.loading}</KkLead>
    <GroupTileGrid>
      {SKELETON_KEYS.map((key) => (
        <GroupTileSkeleton key={key} />
      ))}
    </GroupTileGrid>
  </Stack>
);
