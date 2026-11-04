import { KkMeta } from '@furria/ui/KkMeta';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { KkTabLedger } from '@furria/ui/KkTabLedger';
import type { FC } from 'react';
import { cratesLabel, GIVERS_LABEL, GIVERS_TITLE, NO_GIVERS } from '../beer-a-copy';
import { nameOf, shortDayOf } from '../beer-a-format';
import type { BeerAGiverLine } from '../hooks/use-beer-member-a';

interface BeerAGiversProps {
  givers: readonly BeerAGiverLine[];
}

export const BeerAGivers: FC<BeerAGiversProps> = ({ givers }) => {
  const rows = givers.map((line) => (
    <KkTabLedger.Person
      key={line.giver.personId}
      initials={line.person?.initials ?? ''}
      name={nameOf(line.person)}
      count={cratesLabel(line.giver.crateCount)}
      day={shortDayOf(line.giver.lastAt)}
      own={line.own}
    />
  ));
  const list =
    rows.length === 0 ? (
      <KkMeta>{NO_GIVERS}</KkMeta>
    ) : (
      <KkTabLedger label={GIVERS_LABEL}>{rows}</KkTabLedger>
    );

  return <KkPanelSection title={GIVERS_TITLE}>{list}</KkPanelSection>;
};
