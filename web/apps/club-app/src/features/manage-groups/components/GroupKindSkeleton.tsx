import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { KkSkeletonRow } from '@furria/ui/KkSkeletonRow';
import type { FC } from 'react';
import { AppSkeletonRegion } from '@/features/session/components/AppSkeletonRegion';
import { GROUP_KIND_SECTION_TITLE } from '../manage-groups-labels';

const LOADING_LABEL = 'Die Gruppenart wird geladen';
const FIELD_ROWS = 2;

export const GroupKindSkeleton: FC = () => (
  <AppSkeletonRegion label={LOADING_LABEL}>
    <KkPanelSection title={GROUP_KIND_SECTION_TITLE}>
      <KkPanel>
        <KkSkeletonRow count={FIELD_ROWS} shape="select" />
      </KkPanel>
    </KkPanelSection>
  </AppSkeletonRegion>
);
