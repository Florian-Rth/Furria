import { KkPanel } from '@furria/ui/KkPanel';
import { KkText } from '@furria/ui/KkText';
import type { FC } from 'react';
import { useBeerPotsQuery } from '../api';
import { POTS_EMPTY, POTS_TITLE } from '../beer-hub-copy';
import { BeerPaneFrame } from './BeerPaneFrame';
import { BeerPotRow } from './BeerPotRow';

const CONTEXT = 'übergeben · offene Deckel bleiben bezahlbar';

export const BeerPotsPane: FC = () => {
  const potsQuery = useBeerPotsQuery();
  const closed = (potsQuery.data?.pots ?? []).filter((pot) => pot.closedAt !== null);
  const rows = closed.map((pot) => <BeerPotRow key={pot.beerPotId} pot={pot} />);
  const empty =
    potsQuery.data !== undefined && closed.length === 0 ? (
      <KkText variant="body2" tone="secondary">
        {POTS_EMPTY}
      </KkText>
    ) : null;

  return (
    <BeerPaneFrame icon="archive" title={POTS_TITLE} context={CONTEXT}>
      {empty}
      <KkPanel>{rows}</KkPanel>
    </BeerPaneFrame>
  );
};
