import { KkSkeletonRow } from '@furria/ui/KkSkeletonRow';
import type { FC } from 'react';
import { useBeerHubContext } from '../beer-hub-context';
import { BeerHubOpen } from './BeerHubOpen';
import { BeerLoadError } from './BeerLoadError';
import { BeerOpenPotGate } from './BeerOpenPotGate';

const HUB_SKELETON_ROWS = 8;

export const BeerHubMaster: FC = () => {
  const { state, reload } = useBeerHubContext();

  switch (state.kind) {
    case 'open':
      return <BeerHubOpen open={state.open} />;
    case 'empty':
      return <BeerOpenPotGate />;
    case 'failed':
      return <BeerLoadError error={state.error} onRetry={reload} />;
    default:
      return <KkSkeletonRow count={HUB_SKELETON_ROWS} shape="select" />;
  }
};
