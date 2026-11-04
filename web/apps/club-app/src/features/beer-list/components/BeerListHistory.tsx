import { KkPanelFold } from '@furria/ui/KkPanelFold';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { KkTabLedger } from '@furria/ui/KkTabLedger';
import type { FC, ReactNode } from 'react';
import { HISTORY_LABEL, HISTORY_TITLE, OLDER_PAYMENTS } from '../beer-list-copy';
import type { BeerHistoryGroup } from '../beer-tab';
import { BeerListHistoryGroup } from './BeerListHistoryGroup';

const SHOWN_PAID_GROUPS = 2;

interface BeerListHistoryProps {
  groups: readonly BeerHistoryGroup[];
  myPersonId: number | null;
  now: number;
  freshIds: readonly number[];
}

export const BeerListHistory: FC<BeerListHistoryProps> = ({
  groups,
  myPersonId,
  now,
  freshIds,
}) => {
  const openGroups = groups.filter((group) => group.kind === 'open');
  const paidGroups = groups.filter((group) => group.kind === 'paid');
  const shown = [...openGroups, ...paidGroups.slice(0, SHOWN_PAID_GROUPS)];
  const older = paidGroups.slice(SHOWN_PAID_GROUPS);
  const olderCount = String(older.length);
  const renderGroup = (group: BeerHistoryGroup): ReactNode => (
    <BeerListHistoryGroup
      key={group.key}
      group={group}
      myPersonId={myPersonId}
      now={now}
      freshIds={freshIds}
    />
  );
  const olderFold =
    older.length === 0 ? null : (
      <KkPanelFold label={OLDER_PAYMENTS} flag={olderCount}>
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
