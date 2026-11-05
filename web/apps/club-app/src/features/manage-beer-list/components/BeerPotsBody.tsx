import { KkPanel } from '@furria/ui/KkPanel';
import { KkSkeletonRow } from '@furria/ui/KkSkeletonRow';
import { KkText } from '@furria/ui/KkText';
import type { FC } from 'react';
import { useBeerPotsQuery } from '../api';
import { POTS_EMPTY } from '../beer-hub-copy';
import { BeerLoadError } from './BeerLoadError';
import { BeerPotRow } from './BeerPotRow';

const POTS_SKELETON_ROWS = 3;

export const BeerPotsBody: FC = () => {
  const potsQuery = useBeerPotsQuery();
  const pots = potsQuery.data?.pots;
  const retry = (): void => {
    void potsQuery.refetch();
  };

  if (pots === undefined && potsQuery.error !== null) {
    return <BeerLoadError error={potsQuery.error} onRetry={retry} />;
  }
  if (pots === undefined) {
    return <KkSkeletonRow count={POTS_SKELETON_ROWS} shape="select" />;
  }

  const closed = pots.filter((pot) => pot.closedAt !== null);

  if (closed.length === 0) {
    return (
      <KkText variant="body2" tone="secondary">
        {POTS_EMPTY}
      </KkText>
    );
  }

  const rows = closed.map((pot) => <BeerPotRow key={pot.beerPotId} pot={pot} />);

  return <KkPanel>{rows}</KkPanel>;
};
