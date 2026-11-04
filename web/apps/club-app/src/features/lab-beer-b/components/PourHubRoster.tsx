import { KkPourDay } from '@furria/ui/KkPourDay';
import { KkPourRosterRow } from '@furria/ui/KkPourRosterRow';
import type { KkPourTabState } from '@furria/ui/KkPourStateGlyph';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { labBeerPersonOf } from '@/features/lab-beer/beer-lab-fixture';
import { euroOf } from '@/features/lab-beer/beer-lab-ledger';
import { cratesLabel, fullNameOf } from '../pour-copy';
import type { PourRosterRow } from '../pour-hub';
import { ROSTER_LABEL, rosterFactsOf } from '../pour-hub-copy';

interface PourHubRosterProps {
  rows: readonly PourRosterRow[];
  selectedId: number | null;
  onOpen: (personId: number) => void;
}

const stateOf = (row: PourRosterRow): KkPourTabState => {
  if (row.overdue) {
    return 'overdue';
  }

  return row.tab.openCount > 0 ? 'open' : 'paid';
};

export const PourHubRoster: FC<PourHubRosterProps> = ({ rows, selectedId, onOpen }) => {
  const openCents = rows.reduce((sum, row) => sum + row.tab.openCents, 0);
  const facts = openCents === 0 ? '' : euroOf(openCents);
  const items = rows.map((row) => {
    const person = labBeerPersonOf(row.personId);
    const open = row.tab.openCount > 0;
    const initials = person?.initials ?? '?';
    const name = fullNameOf(person);
    const state = stateOf(row);
    const rowFacts = rosterFactsOf(row);
    const amount = open ? euroOf(row.tab.openCents) : null;
    const count = open ? `${cratesLabel(row.tab.openCount)} offen` : null;
    const select = (): void => {
      onOpen(row.personId);
    };

    return (
      <KkPourRosterRow
        key={row.personId}
        initials={initials}
        name={name}
        state={state}
        facts={rowFacts}
        amount={amount}
        count={count}
        selected={row.personId === selectedId}
        onSelect={select}
      />
    );
  });

  return (
    <Stack component="section" aria-label={ROSTER_LABEL}>
      <KkPourDay label={ROSTER_LABEL} facts={facts} />
      {items}
    </Stack>
  );
};
