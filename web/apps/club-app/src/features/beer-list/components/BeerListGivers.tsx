import { KkMeta } from '@furria/ui/KkMeta';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { KkTabLedger } from '@furria/ui/KkTabLedger';
import type { FC } from 'react';
import { toInitials } from '@/lib/initials';
import { GIVERS_LABEL, GIVERS_TITLE, NO_GIVERS } from '../beer-list-copy';
import { cratesLabel } from '../booking/booking-copy';
import type { BeerGiver } from '../schemas';

interface BeerListGiversProps {
  givers: readonly BeerGiver[];
  myPersonId: number | null;
}

export const BeerListGivers: FC<BeerListGiversProps> = ({ givers, myPersonId }) => {
  const rows = givers.map((giver) => {
    const initials = toInitials(giver.firstName, giver.lastName);
    const name = `${giver.firstName} ${giver.lastName}`;
    const count = cratesLabel(giver.crates);
    const own = giver.personId === myPersonId;

    return (
      <KkTabLedger.Person
        key={giver.personId}
        initials={initials}
        name={name}
        count={count}
        own={own}
      />
    );
  });
  const list =
    rows.length === 0 ? (
      <KkMeta>{NO_GIVERS}</KkMeta>
    ) : (
      <KkTabLedger label={GIVERS_LABEL}>{rows}</KkTabLedger>
    );

  return <KkPanelSection title={GIVERS_TITLE}>{list}</KkPanelSection>;
};
