import { KkSkeletonRow } from '@furria/ui/KkSkeletonRow';
import type { FC } from 'react';
import { useMyself } from '../hooks/use-myself';
import { BeerOpenPotForm } from './BeerOpenPotForm';

const FORM_SKELETON_ROWS = 5;

export const BeerOpenPotGate: FC = () => {
  const myself = useMyself();

  if (myself.kind === 'loading') {
    return <KkSkeletonRow count={FORM_SKELETON_ROWS} shape="select" />;
  }

  return <BeerOpenPotForm owner={myself.person} />;
};
