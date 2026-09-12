import { KkPanel, KkSkeletonRow } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { MANAGE_GROUPS_SECTION_TITLES } from '../manage-groups-labels';
import { ManagedGroupsSection } from './ManagedGroupsSection';

const MEMBER_ROWS = 5;
const ADMIN_ROWS = 2;

export const GroupOverrideSkeleton: FC = () => (
  <Stack sx={{ gap: 3.5, minWidth: 0 }}>
    <ManagedGroupsSection title={MANAGE_GROUPS_SECTION_TITLES.members}>
      <KkPanel variant="list">
        <KkSkeletonRow count={MEMBER_ROWS} />
      </KkPanel>
    </ManagedGroupsSection>
    <ManagedGroupsSection title={MANAGE_GROUPS_SECTION_TITLES.admins}>
      <KkPanel variant="list">
        <KkSkeletonRow count={ADMIN_ROWS} />
      </KkPanel>
    </ManagedGroupsSection>
  </Stack>
);
