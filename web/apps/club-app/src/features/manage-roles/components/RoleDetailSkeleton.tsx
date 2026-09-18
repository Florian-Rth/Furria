import { KkPanel, KkPanelSection, KkPanelStack, KkSkeletonBlock, KkSkeletonRow } from '@furria/ui';
import type { FC } from 'react';
import { AppSkeletonRegion } from '@/features/session';
import { ROLE_SECTION_TITLES } from '../manage-roles-labels';

const HEADER_LINES = 4;
const HOLDER_ROWS = 2;
const PERMISSION_ROWS = 4;

const LOADING_LABEL = 'Die Rolle wird geladen';

export const RoleDetailSkeleton: FC = () => (
  <AppSkeletonRegion label={LOADING_LABEL}>
    <KkPanelStack>
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
    </KkPanelStack>
  </AppSkeletonRegion>
);
