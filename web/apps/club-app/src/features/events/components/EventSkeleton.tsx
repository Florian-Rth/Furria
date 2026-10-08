import { KkPanel, KkPanelSection, KkPanelStack, KkSkeletonBlock } from '@furria/ui';
import type { FC } from 'react';
import { AppSkeletonRegion } from '@/features/session';
import { EVENT_SECTION_TITLES } from '../events-labels';

const FACTS_LINES = 5;
const TICKETS_LINES = 3;
const LOADING_LABEL = 'Die Veranstaltung wird geladen';

export const EventSkeleton: FC = () => (
  <AppSkeletonRegion label={LOADING_LABEL}>
    <KkPanelStack>
      <KkPanelSection title={EVENT_SECTION_TITLES.facts}>
        <KkPanel variant="block">
          <KkSkeletonBlock lines={FACTS_LINES} />
        </KkPanel>
      </KkPanelSection>
      <KkPanelSection title={EVENT_SECTION_TITLES.tickets}>
        <KkPanel variant="block">
          <KkSkeletonBlock lines={TICKETS_LINES} />
        </KkPanel>
      </KkPanelSection>
    </KkPanelStack>
  </AppSkeletonRegion>
);
