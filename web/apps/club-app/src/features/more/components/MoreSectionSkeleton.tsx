import { KkPanel, KkPanelSection, KkSkeletonRow } from '@furria/ui';
import type { FC } from 'react';
import { AppSkeletonRegion } from '@/features/session';

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
