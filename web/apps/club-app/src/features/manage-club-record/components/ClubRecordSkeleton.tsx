import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { KkPanelStack } from '@furria/ui/KkPanelStack';
import { KkSkeletonBlock } from '@furria/ui/KkSkeletonBlock';
import type { FC } from 'react';
import { AppSkeletonRegion } from '@/features/session/components/AppSkeletonRegion';
import { CLUB_RECORD_SECTION_TITLES } from '../club-record-labels';

const LOADING_LABEL = 'Die Vereinsdaten werden geladen';
const IDENTITY_LINES = 3;
const CONTACT_LINES = 6;
const ACCESS_LINES = 1;
const STAGE_LINES = 4;

export const ClubRecordSkeleton: FC = () => (
  <AppSkeletonRegion label={LOADING_LABEL}>
    <KkPanelStack>
      <KkPanelSection title={CLUB_RECORD_SECTION_TITLES.identity}>
        <KkPanel variant="block">
          <KkSkeletonBlock lines={IDENTITY_LINES} />
        </KkPanel>
      </KkPanelSection>
      <KkPanelSection title={CLUB_RECORD_SECTION_TITLES.contact}>
        <KkPanel variant="block">
          <KkSkeletonBlock lines={CONTACT_LINES} />
        </KkPanel>
      </KkPanelSection>
      <KkPanelSection title={CLUB_RECORD_SECTION_TITLES.access}>
        <KkPanel variant="block">
          <KkSkeletonBlock lines={ACCESS_LINES} />
        </KkPanel>
      </KkPanelSection>
      <KkPanelSection title={CLUB_RECORD_SECTION_TITLES.stage}>
        <KkPanel variant="block">
          <KkSkeletonBlock lines={STAGE_LINES} />
        </KkPanel>
      </KkPanelSection>
    </KkPanelStack>
  </AppSkeletonRegion>
);
