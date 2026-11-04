import { KkSelectField } from '@furria/ui/KkSelectField';
import { KkText } from '@furria/ui/KkText';
import type { FC, ReactNode } from 'react';
import type { PourHub } from '../hooks/use-pour-hub';
import { usePourPersonPick } from '../hooks/use-pour-person-pick';
import { NO_OPEN_TABS, PERSON_LABEL, personOptionLabelOf } from '../pour-hub-copy';
import { PourFormFrame } from './PourFormFrame';
import { PourPaymentBlock } from './PourPaymentBlock';

interface PourPaymentPaneProps {
  hub: PourHub;
  initialPersonId: number | null;
  framed: boolean;
  actions: ReactNode;
}

export const PourPaymentPane: FC<PourPaymentPaneProps> = ({
  hub,
  initialPersonId,
  framed,
  actions,
}) => {
  const openRows = hub.roster.filter((row) => row.tab.openCount > 0);
  const pick = usePourPersonPick(
    initialPersonId ?? openRows[0]?.personId ?? null,
    openRows.map((row) => row.personId),
  );
  const options = openRows.map((row) => ({
    value: String(row.personId),
    label: personOptionLabelOf(row),
  }));
  const picked = openRows.find((row) => row.personId === pick.personId) ?? null;
  const book = (crateCount: number): void => {
    if (picked !== null && hub.payment(picked.personId, crateCount)) {
      hub.closeSide();
    }
  };
  const block =
    picked === null ? null : (
      <PourPaymentBlock
        key={`${picked.personId}-${picked.tab.openCount}`}
        tab={picked.tab}
        now={hub.world.now}
        onBook={book}
      />
    );
  const content =
    openRows.length === 0 ? (
      <KkText variant="body2" tone="secondary">
        {NO_OPEN_TABS}
      </KkText>
    ) : (
      <KkSelectField
        name="person"
        label={PERSON_LABEL}
        value={pick.value}
        options={options}
        presentation="select"
        onChange={pick.choose}
      />
    );

  return (
    <PourFormFrame form="payment" framed={framed} actions={actions} refusal={hub.refusal}>
      {content}
      {block}
    </PourFormFrame>
  );
};
