import { KkPanel, KkPanelSection, KkSkeletonBlock, KkSkeletonRow } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { AppSkeletonRegion } from '@/features/session';
import { ROLE_SECTION_TITLES } from '../manage-roles-labels';

const HEADER_LINES = 4;
const HOLDER_ROWS = 2;
const PERMISSION_ROWS = 4;

const LOADING_LABEL = 'Die Rolle wird geladen';

export const RoleDetailSkeleton: FC = () => (
  <AppSkeletonRegion label={LOADING_LABEL}>
    <Stack sx={{ gap: 3.5, minWidth: 0 }}>
      <KkPanel variant="block">
        <KkSkeletonBlock lines={HEADER_LINES} />
      </KkPanel>
      <KkPanelSection title={ROLE_SECTION_TITLES.holders}>
        <KkPanel variant="list">
          <KkSkeletonRow count={HOLDER_ROWS} />
        </KkPanel>
      </KkPanelSection>
      <KkPanelSection title={ROLE_SECTION_TITLES.permissions}>
        <KkPanel variant="list">
          <KkSkeletonRow count={PERMISSION_ROWS} />
        </KkPanel>
      </KkPanelSection>
    </Stack>
  </AppSkeletonRegion>
);
