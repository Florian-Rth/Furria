import { KkPanel, KkPanelSection, KkPanelStack, KkSkeletonBlock, KkSkeletonRow } from '@furria/ui';
import type { FC } from 'react';
import { AppSkeletonRegion } from '@/features/session';
import { GROUP_SECTION_TITLES } from '@/lib/group-sections';

const DESCRIPTION_LINES = 3;
const ADMIN_ROWS = 2;
const ROSTER_LINES = 4;
const RESERVED_LINES = 2;

const LOADING_LABEL = 'Die Gruppe wird geladen';

export const HubSkeleton: FC = () => (
  <AppSkeletonRegion label={LOADING_LABEL}>
    <KkPanelStack>
      <KkPanelSection title={GROUP_SECTION_TITLES.description}>
        <KkPanel variant="block">
          <KkSkeletonBlock lines={DESCRIPTION_LINES} />
        </KkPanel>
      </KkPanelSection>
      <KkPanelSection title={GROUP_SECTION_TITLES.admins}>
        <KkPanel variant="list">
          <KkSkeletonRow count={ADMIN_ROWS} />
        </KkPanel>
      </KkPanelSection>
      <KkPanelSection title={GROUP_SECTION_TITLES.members}>
        <KkPanel variant="block">
          <KkSkeletonBlock lines={ROSTER_LINES} />
        </KkPanel>
      </KkPanelSection>
      <KkPanelSection title={GROUP_SECTION_TITLES.rhythm}>
        <KkPanel variant="block">
          <KkSkeletonBlock lines={RESERVED_LINES} />
        </KkPanel>
      </KkPanelSection>
    </KkPanelStack>
  </AppSkeletonRegion>
);
