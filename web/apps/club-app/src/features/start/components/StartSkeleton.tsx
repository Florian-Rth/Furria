import { KkDensePanelSkeleton } from '@furria/ui';
import type { FC } from 'react';
import { AppSkeletonRegion } from '@/features/session';

const LOADING_LABEL = 'Start wird geladen';

export const StartSkeleton: FC = () => (
  <AppSkeletonRegion label={LOADING_LABEL}>
    <KkDensePanelSkeleton />
  </AppSkeletonRegion>
);
