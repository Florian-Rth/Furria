import { KkPanel, KkPanelSection, KkPanelStack, KkSkeletonRow } from '@furria/ui';
import type { FC } from 'react';
import { AppSkeletonRegion } from '@/features/session';
import { GROUP_SECTION_TITLES } from '@/lib/group-sections';
import { MANAGE_GROUPS_SECTION_TITLES } from '../manage-groups-labels';

const MEMBER_ROWS = 5;
const ADMIN_ROWS = 2;
const HISTORY_ROWS = 3;

const LOADING_LABEL = 'Die Gruppe wird geladen';

export const GroupOverrideSkeleton: FC = () => (
  <AppSkeletonRegion label={LOADING_LABEL}>
    <KkPanelStack>
      <KkPanelSection title={MANAGE_GROUPS_SECTION_TITLES.members}>
        <KkPanel variant="list">
          <KkSkeletonRow count={MEMBER_ROWS} />
        </KkPanel>
      </KkPanelSection>
      <KkPanelSection title={GROUP_SECTION_TITLES.admins}>
        <KkPanel variant="list">
          <KkSkeletonRow count={ADMIN_ROWS} />
        </KkPanel>
      </KkPanelSection>
      <KkPanelSection title={GROUP_SECTION_TITLES.history}>
        <KkPanel variant="list">
          <KkSkeletonRow count={HISTORY_ROWS} />
        </KkPanel>
      </KkPanelSection>
    </KkPanelStack>
  </AppSkeletonRegion>
);
