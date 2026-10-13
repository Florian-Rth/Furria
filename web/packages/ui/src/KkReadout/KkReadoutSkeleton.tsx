import type { FC } from 'react';
import { KkSkeletonBlock } from '../KkSkeletonBlock';
import type { KkSx } from '../kk-sx';
import { KkReadoutRoot } from './internal/layout/KkReadoutRoot';

interface KkReadoutSkeletonProps {
  title: string;
  lines?: number;
  sx?: KkSx;
}

export const KkReadoutSkeleton: FC<KkReadoutSkeletonProps> = ({ title, lines = 3, sx }) => (
  <KkReadoutRoot title={title} sx={sx}>
    <KkSkeletonBlock lines={lines} />
  </KkReadoutRoot>
);
