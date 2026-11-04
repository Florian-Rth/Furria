import { KkLedgerList } from '@furria/ui/KkLedgerList';
import { KkLedgerMonth } from '@furria/ui/KkLedgerMonth';
import { KkText } from '@furria/ui/KkText';
import type { FC } from 'react';
import { monthAside, STATEMENT_COLUMNS, STATEMENT_EMPTY, STATEMENT_LABEL } from '../ledger-copy';
import { monthLabelOf } from '../ledger-format';
import type { LedgerMonth } from '../ledger-statement';
import { LedgerEntryRow } from './LedgerEntryRow';

interface LedgerStatementProps {
  months: readonly LedgerMonth[];
  freshIds: readonly number[];
}

export const LedgerStatement: FC<LedgerStatementProps> = ({ months, freshIds }) => {
  if (months.length === 0) {
    return (
      <KkText variant="body2" tone="secondary">
        {STATEMENT_EMPTY}
      </KkText>
    );
  }

  const items = months.flatMap((month) => {
    const label = monthLabelOf(month.at);
    const aside = monthAside(month.crateCount);
    const rows = month.entries.map((entry) => {
      const fresh = entry.kind === 'crate' && freshIds.includes(entry.crateId);

      return <LedgerEntryRow key={entry.key} entry={entry} fresh={fresh} />;
    });

    return [<KkLedgerMonth key={month.key} label={label} aside={aside} />, ...rows];
  });

  return (
    <KkLedgerList label={STATEMENT_LABEL} columns={STATEMENT_COLUMNS}>
      {items}
    </KkLedgerList>
  );
};
