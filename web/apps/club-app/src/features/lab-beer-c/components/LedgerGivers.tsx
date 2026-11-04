import type { KkLedgerTableColumn, KkLedgerTableRow } from '@furria/ui/KkLedgerTable';
import { KkLedgerTable } from '@furria/ui/KkLedgerTable';
import type { FC } from 'react';
import { GIVERS_COUNT, GIVERS_LABEL, GIVERS_LAST, GIVERS_NAME } from '../ledger-copy';
import { dayOf } from '../ledger-format';
import type { GiverLine } from '../ledger-givers';

const COLUMNS: readonly KkLedgerTableColumn[] = [
  { key: 'name', label: GIVERS_NAME, width: null, align: 'left' },
  { key: 'count', label: GIVERS_COUNT, width: '3.5rem', align: 'right' },
  { key: 'last', label: GIVERS_LAST, width: '4.5rem', align: 'right' },
];

interface LedgerGiversProps {
  givers: readonly GiverLine[];
}

export const LedgerGivers: FC<LedgerGiversProps> = ({ givers }) => {
  const rows: readonly KkLedgerTableRow[] = givers.map((giver) => ({
    key: String(giver.person.id),
    cells: [
      `${giver.person.firstName} ${giver.person.lastName}`,
      String(giver.crateCount),
      dayOf(giver.lastAt),
    ],
  }));

  return <KkLedgerTable label={GIVERS_LABEL} columns={COLUMNS} rows={rows} />;
};
