import { KkPourDay } from '@furria/ui/KkPourDay';
import { KkText } from '@furria/ui/KkText';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useBeerJournalQuery, useBeerPotsQuery, useBeerTabsQuery } from '../api';
import { openCratesOf } from '../beer-hub';
import { useBeerHubContext } from '../beer-hub-context';
import { cratesLabel, euroOf, fullNameOf, potFactsOf, potLabelOf } from '../beer-hub-copy';
import { BeerPaneFrame } from './BeerPaneFrame';
import { BeerPaymentBlock } from './BeerPaymentBlock';

const ALL_PAID = 'Auf dieser Liste ist alles bezahlt.';
const STAY_IN_PANE = (): undefined => undefined;

interface BeerClosedPotPaneProps {
  beerPotId: number;
}

export const BeerClosedPotPane: FC<BeerClosedPotPaneProps> = ({ beerPotId }) => {
  const hub = useBeerHubContext();
  const pot = useBeerPotsQuery().data?.pots.find((entry) => entry.beerPotId === beerPotId) ?? null;
  const tabs = useBeerTabsQuery(beerPotId).data?.tabs ?? [];
  const crates = useBeerJournalQuery(beerPotId).data?.crates ?? [];
  const title = pot === null ? '' : potLabelOf(pot.owner, pot.openedAt, pot.closedAt);
  const context = pot === null ? '' : potFactsOf(pot.openTabs, pot.openCents);
  const owing = tabs.filter((tab) => tab.openCrates > 0);
  const sections = owing.map((tab) => {
    const name = fullNameOf(tab.person);
    const facts = `${cratesLabel(tab.openCrates)} · ${euroOf(tab.openCents)}`;
    const target = {
      beerPotId,
      person: tab.person,
      oldestFirst: openCratesOf(crates, tab.person.personId),
    };

    return (
      <Stack key={tab.person.personId} sx={{ gap: 1 }}>
        <KkPourDay label={name} facts={facts} />
        <BeerPaymentBlock
          key={target.oldestFirst.length}
          target={target}
          now={hub.now}
          onDone={STAY_IN_PANE}
        />
      </Stack>
    );
  });
  const empty =
    owing.length === 0 ? (
      <KkText variant="body2" tone="secondary">
        {ALL_PAID}
      </KkText>
    ) : null;

  return (
    <BeerPaneFrame icon="archive" title={title} context={context}>
      {empty}
      {sections}
    </BeerPaneFrame>
  );
};
