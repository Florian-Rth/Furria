import { KkSkeletonRow } from '@furria/ui/KkSkeletonRow';
import { KkText } from '@furria/ui/KkText';
import type { FC } from 'react';
import { ALL_PAID } from '../beer-hub-copy';
import { closedPotLandingOf } from '../beer-landing';
import type { ClosedPotPane } from '../hooks/use-closed-pot-pane';
import { BeerLoadError } from './BeerLoadError';
import { BeerOwingBlock } from './BeerOwingBlock';

const OWING_SKELETON_ROWS = 4;

interface BeerClosedPotBodyProps {
  beerPotId: number;
  pane: ClosedPotPane;
}

export const BeerClosedPotBody: FC<BeerClosedPotBodyProps> = ({ beerPotId, pane }) => {
  if (pane.kind === 'loading') {
    return <KkSkeletonRow count={OWING_SKELETON_ROWS} shape="select" />;
  }
  if (pane.kind === 'failed') {
    return <BeerLoadError error={pane.error} onRetry={pane.retry} />;
  }
  if (pane.owing.length === 0) {
    return (
      <KkText variant="body2" tone="secondary">
        {ALL_PAID}
      </KkText>
    );
  }

  const landing = closedPotLandingOf(beerPotId);

  return pane.owing.map((target) => (
    <BeerOwingBlock key={target.person.personId} target={target} landing={landing} />
  ));
};
