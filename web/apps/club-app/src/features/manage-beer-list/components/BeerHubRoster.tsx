import { KkPourDay } from '@furria/ui/KkPourDay';
import { KkPourRosterRow } from '@furria/ui/KkPourRosterRow';
import { KkText } from '@furria/ui/KkText';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { toInitials } from '@/lib/initials';
import type { BeerRosterRow } from '../beer-hub';
import { useBeerHubContext } from '../beer-hub-context';
import {
  cratesLabel,
  euroOf,
  fullNameOf,
  NO_PEOPLE,
  ROSTER_LABEL,
  rosterFactsOf,
} from '../beer-hub-copy';

interface BeerHubRosterProps {
  rows: readonly BeerRosterRow[];
}

export const BeerHubRoster: FC<BeerHubRosterProps> = ({ rows }) => {
  const hub = useBeerHubContext();
  const openCents = rows.reduce((sum, row) => sum + row.openCents, 0);
  const facts = openCents === 0 ? '' : euroOf(openCents);
  const items = rows.map((row) => {
    const open = row.openCrates > 0;
    const initials = toInitials(row.person.firstName, row.person.lastName);
    const name = fullNameOf(row.person);
    const rowFacts = rosterFactsOf(row);
    const amount = open ? euroOf(row.openCents) : null;
    const count = open ? `${cratesLabel(row.openCrates)} offen` : null;
    const select = (): void => {
      hub.openPerson(row.person.personId);
    };

    return (
      <KkPourRosterRow
        key={row.person.personId}
        initials={initials}
        name={name}
        state={row.state}
        facts={rowFacts}
        amount={amount}
        count={count}
        selected={row.person.personId === hub.selectedPersonId}
        onSelect={select}
      />
    );
  });
  const empty =
    rows.length === 0 ? (
      <KkText variant="body2" tone="secondary">
        {NO_PEOPLE}
      </KkText>
    ) : null;

  return (
    <Stack component="section" aria-label={ROSTER_LABEL}>
      <KkPourDay label={ROSTER_LABEL} facts={facts} />
      {empty}
      {items}
    </Stack>
  );
};
