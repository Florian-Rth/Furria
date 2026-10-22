import { KkDensePanelSkeleton } from '@furria/ui/KkDensePanelSkeleton';
import type { FC } from 'react';
import { AppSkeletonRegion } from '@/features/session/components/AppSkeletonRegion';

const LOADING_LABEL = 'Start wird geladen';

export const StartSkeleton: FC = () => (
  <AppSkeletonRegion label={LOADING_LABEL}>
    <KkDensePanelSkeleton />
  </AppSkeletonRegion>
);
