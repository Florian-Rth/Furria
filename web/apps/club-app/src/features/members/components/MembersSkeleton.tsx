import { KkSkeletonRow } from '@furria/ui';
import type { FC } from 'react';

const SKELETON_ROWS = 8;

export const MembersSkeleton: FC = () => <KkSkeletonRow count={SKELETON_ROWS} />;
