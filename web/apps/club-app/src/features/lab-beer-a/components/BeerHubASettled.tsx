import { KkPanelFold } from '@furria/ui/KkPanelFold';
import { KkTabLedger } from '@furria/ui/KkTabLedger';
import type { FC } from 'react';
import { labBeerPersonOf } from '@/features/lab-beer/beer-lab-fixture';
import { cratesLabel, SETTLED_LABEL, SETTLED_TITLE } from '../beer-a-copy';
import { nameOf, shortDayOf } from '../beer-a-format';
import type { BeerASettledRow } from '../beer-a-queue';

interface BeerHubASettledProps {
  rows: readonly BeerASettledRow[];
}

export const BeerHubASettled: FC<BeerHubASettledProps> = ({ rows }) => {
  if (rows.length === 0) {
    return null;
  }

  const lines = rows.map((row) => {
    const person = labBeerPersonOf(row.personId);

    return (
      <KkTabLedger.Person
        key={row.personId}
        initials={person?.initials ?? ''}
        name={nameOf(person)}
        count={cratesLabel(row.paidCount)}
        day={shortDayOf(row.lastPaidAt)}
      />
    );
  });

  return (
    <KkPanelFold label={SETTLED_TITLE} flag={String(rows.length)}>
      <KkTabLedger label={SETTLED_LABEL} sx={{ mt: 1 }}>
        {lines}
      </KkTabLedger>
    </KkPanelFold>
  );
};
