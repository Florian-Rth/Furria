import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { KkSkeletonBlock } from '@furria/ui/KkSkeletonBlock';
import type { FC } from 'react';
import { AppSkeletonRegion } from '@/features/session/components/AppSkeletonRegion';
import { DECISION_SECTION, DETAIL_LOADING_LABEL } from '../intake-labels';

const LINES = 4;

export const IntakeDetailSkeleton: FC = () => (
  <AppSkeletonRegion label={DETAIL_LOADING_LABEL}>
    <KkPanelSection title={DECISION_SECTION}>
      <KkPanel variant="block">
        <KkSkeletonBlock lines={LINES} />
      </KkPanel>
    </KkPanelSection>
  </AppSkeletonRegion>
);
