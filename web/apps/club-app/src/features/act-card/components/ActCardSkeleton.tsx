import { KkSkeletonBlock } from '@furria/ui/KkSkeletonBlock';
import type { FC } from 'react';
import { ACT_LOADING_LABEL } from '@/features/acts/act-page-copy';
import { AppSkeletonRegion } from '@/features/session/components/AppSkeletonRegion';

const SKELETON_LINES = 8;

export const ActCardSkeleton: FC = () => (
  <AppSkeletonRegion label={ACT_LOADING_LABEL}>
    <KkSkeletonBlock lines={SKELETON_LINES} />
  </AppSkeletonRegion>
);
