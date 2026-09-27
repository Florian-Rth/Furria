import { KkPanel, KkPanelSection, KkPanelStack, KkSkeletonBlock } from '@furria/ui';
import type { FC } from 'react';
import { AppSkeletonRegion } from '@/features/session';
import { CLUB_RECORD_SECTION_TITLES } from '../club-record-labels';

const LOADING_LABEL = 'Die Vereinsdaten werden geladen';
const IDENTITY_LINES = 3;
const CONTACT_LINES = 6;
const ACCESS_LINES = 1;

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
    </KkPanelStack>
  </AppSkeletonRegion>
);
