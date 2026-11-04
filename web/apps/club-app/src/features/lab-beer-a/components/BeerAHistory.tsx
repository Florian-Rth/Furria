import { KkPanelFold } from '@furria/ui/KkPanelFold';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { KkTabLedger } from '@furria/ui/KkTabLedger';
import type { FC } from 'react';
import type { LabBeerTab } from '@/features/lab-beer/beer-lab-types';
import { HISTORY_LABEL, HISTORY_TITLE, OLDER_PAYMENTS } from '../beer-a-copy';
import type { BeerAHistoryGroup as HistoryGroup } from '../beer-a-tab';
import { historyOf } from '../beer-a-tab';
import { BeerAHistoryGroup } from './BeerAHistoryGroup';

const SHOWN_PAID_GROUPS = 2;

const groupKeyOf = (group: HistoryGroup): string =>
  group.kind === 'open' ? 'open' : `paid-${group.payment.id}`;

interface BeerAHistoryProps {
  tab: LabBeerTab;
  now: string;
  freshIds: readonly number[];
}

export const BeerAHistory: FC<BeerAHistoryProps> = ({ tab, now, freshIds }) => {
  const groups = historyOf(tab);
  const openGroups = groups.filter((group) => group.kind === 'open');
  const paidGroups = groups.filter((group) => group.kind === 'paid');
  const shown = [...openGroups, ...paidGroups.slice(0, SHOWN_PAID_GROUPS)];
  const older = paidGroups.slice(SHOWN_PAID_GROUPS);
  const renderGroup = (group: HistoryGroup) => (
    <BeerAHistoryGroup
      key={groupKeyOf(group)}
      group={group}
      personId={tab.personId}
      now={now}
      freshIds={freshIds}
    />
  );
  const olderFold =
    older.length === 0 ? null : (
      <KkPanelFold label={OLDER_PAYMENTS} flag={String(older.length)}>
        <KkTabLedger label={OLDER_PAYMENTS}>{older.map(renderGroup)}</KkTabLedger>
      </KkPanelFold>
    );

  return (
    <KkPanelSection title={HISTORY_TITLE}>
      <KkTabLedger label={HISTORY_LABEL}>{shown.map(renderGroup)}</KkTabLedger>
      {olderFold}
    </KkPanelSection>
  );
};
