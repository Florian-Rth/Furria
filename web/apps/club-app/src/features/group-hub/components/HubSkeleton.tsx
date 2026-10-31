import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { KkPanelStack } from '@furria/ui/KkPanelStack';
import { KkSkeletonBlock } from '@furria/ui/KkSkeletonBlock';
import type { FC } from 'react';
import { AppSkeletonRegion } from '@/features/session/components/AppSkeletonRegion';
import { GROUP_SECTION_TITLES } from '@/lib/group-sections';

const DESCRIPTION_LINES = 3;
const PEOPLE_LINES = 4;
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
      <KkPanelSection title={GROUP_SECTION_TITLES.members}>
        <KkPanel variant="block">
          <KkSkeletonBlock lines={PEOPLE_LINES} />
        </KkPanel>
      </KkPanelSection>
      <KkPanelSection title={GROUP_SECTION_TITLES.usualTrainingTimes}>
        <KkPanel variant="block">
          <KkSkeletonBlock lines={RESERVED_LINES} />
        </KkPanel>
      </KkPanelSection>
    </KkPanelStack>
  </AppSkeletonRegion>
);
