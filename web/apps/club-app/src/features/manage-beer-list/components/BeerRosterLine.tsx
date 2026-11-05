import { KkPourRosterRow } from '@furria/ui/KkPourRosterRow';
import type { FC } from 'react';
import { toInitials } from '@/lib/initials';
import type { BeerRosterRow } from '../beer-hub';
import { useBeerHubContext } from '../beer-hub-context';
import { euroOf, fullNameOf, openCountOf, rosterFactsOf } from '../beer-hub-copy';

interface BeerRosterLineProps {
  row: BeerRosterRow;
}

export const BeerRosterLine: FC<BeerRosterLineProps> = ({ row }) => {
  const hub = useBeerHubContext();
  const open = row.openCrates > 0;
  const initials = toInitials(row.person.firstName, row.person.lastName);
  const name = fullNameOf(row.person);
  const facts = rosterFactsOf(row);
  const amount = open ? euroOf(row.openCents) : null;
  const count = open ? openCountOf(row.openCrates) : null;
  const selected = row.person.personId === hub.selectedPersonId;
  const select = (): void => {
    hub.openPerson(row.person.personId);
  };

  return (
    <KkPourRosterRow
      initials={initials}
      name={name}
      state={row.state}
      facts={facts}
      amount={amount}
      count={count}
      selected={selected}
      onSelect={select}
    />
  );
};
