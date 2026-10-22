import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { KkSkeletonRow } from '@furria/ui/KkSkeletonRow';
import type { FC } from 'react';
import { AppSkeletonRegion } from '@/features/session/components/AppSkeletonRegion';

const LOADING_LABEL = 'Wird geladen';

interface MoreSectionSkeletonProps {
  title: string;
  rowCount: number;
}

export const MoreSectionSkeleton: FC<MoreSectionSkeletonProps> = ({ title, rowCount }) => (
  <AppSkeletonRegion label={LOADING_LABEL}>
    <KkPanelSection title={title}>
      <KkPanel>
        <KkSkeletonRow count={rowCount} shape="select" />
      </KkPanel>
    </KkPanelSection>
  </AppSkeletonRegion>
);
