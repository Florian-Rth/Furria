import { KkDensePanelSkeleton } from '@furria/ui';
import type { FC } from 'react';
import { AppSkeletonRegion } from '@/features/session';

const LOADING_LABEL = 'Deine Übersicht wird geladen';

export const StartSkeleton: FC = () => (
  <AppSkeletonRegion label={LOADING_LABEL}>
    <KkDensePanelSkeleton />
  </AppSkeletonRegion>
);
