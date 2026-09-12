import { KkPanel, KkPanelSection, KkSkeletonRow } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { AppSkeletonRegion } from '@/features/session';
import { MANAGE_GROUPS_SECTION_TITLES } from '../manage-groups-labels';

const MEMBER_ROWS = 5;
const ADMIN_ROWS = 2;

const LOADING_LABEL = 'Die Gruppe wird geladen';

export const GroupOverrideSkeleton: FC = () => (
  <AppSkeletonRegion label={LOADING_LABEL}>
    <Stack sx={{ gap: 3.5, minWidth: 0 }}>
      <KkPanelSection title={MANAGE_GROUPS_SECTION_TITLES.members}>
        <KkPanel variant="list">
          <KkSkeletonRow count={MEMBER_ROWS} />
        </KkPanel>
      </KkPanelSection>
      <KkPanelSection title={MANAGE_GROUPS_SECTION_TITLES.admins}>
        <KkPanel variant="list">
          <KkSkeletonRow count={ADMIN_ROWS} />
        </KkPanel>
      </KkPanelSection>
    </Stack>
  </AppSkeletonRegion>
);
