import { KkHubRow } from '@furria/ui/KkHubRow';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { potFactsOf, potLabelOf } from '../beer-hub-copy';
import { closedPotPathOf } from '../beer-landing';
import type { BeerPotSummary } from '../schemas';

interface BeerPotRowProps {
  pot: BeerPotSummary;
}

export const BeerPotRow: FC<BeerPotRowProps> = ({ pot }) => {
  const label = potLabelOf(pot.owner, pot.openedAt, pot.closedAt);
  const meta = potFactsOf(pot.openTabs, pot.openCents);
  const to = closedPotPathOf(pot.beerPotId);

  return <KkHubRow label={label} icon="archive" meta={meta} component={Link} to={to} />;
};
