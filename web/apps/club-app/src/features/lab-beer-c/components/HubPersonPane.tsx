import { KkConfirmDialog } from '@furria/ui/KkConfirmDialog';
import type { KkIconTab } from '@furria/ui/KkIconTabs';
import { KkIconTabs } from '@furria/ui/KkIconTabs';
import { KkStepPane } from '@furria/ui/KkStepPane';
import type { KkStepState } from '@furria/ui/step-state';
import type { FC, ReactNode } from 'react';
import { euroOf } from '@/features/lab-beer/beer-lab-ledger';
import type { LabBeerWorldState } from '@/features/lab-beer/use-lab-beer-world';
import { useHubPerson } from '../hooks/use-hub-person';
import {
  END_CONFIRM,
  PANE_TAB_ENROLLMENT,
  PANE_TAB_TAB,
  PANE_TABS_LABEL,
  paneContext,
  ROW_STATE_LABELS,
} from '../ledger-copy';
import type { PersonLine, RowState } from '../ledger-hub';
import { rowStateOf } from '../ledger-hub';
import { HubCrateComposer } from './HubCrateComposer';
import { HubEnrollment } from './HubEnrollment';
import { HubPaymentComposer } from './HubPaymentComposer';
import { HubPersonFoot } from './HubPersonFoot';
import { LedgerStatement } from './LedgerStatement';

const TABS: readonly KkIconTab[] = [
  { id: 'tab', label: PANE_TAB_TAB, icon: 'list' },
  { id: 'enrollment', label: PANE_TAB_ENROLLMENT, icon: 'handshake' },
];

const HEAD_STATES: Record<RowState, KkStepState> = {
  ended: 'off',
  overdue: 'overdue',
  open: 'open',
  clear: 'done',
  fresh: 'waiting',
};

const NO_FACTS = [] as const;

interface HubPersonPaneProps {
  beer: LabBeerWorldState;
  line: PersonLine;
  operatorId: number;
  framed: boolean;
  close: ReactNode;
}

export const HubPersonPane: FC<HubPersonPaneProps> = ({
  beer,
  line,
  operatorId,
  framed,
  close,
}) => {
  const person = useHubPerson(beer, line.person.id, operatorId);
  const name = `${line.person.firstName} ${line.person.lastName}`;
  const rowState = rowStateOf(line);
  const context = paneContext(person.tab.openCount, euroOf(person.tab.openCents));
  const actions = (
    <>
      <KkIconTabs
        label={PANE_TABS_LABEL}
        tabs={TABS}
        value={person.section}
        onChange={person.chooseSection}
      />
      {close}
    </>
  );
  const composer =
    person.composer === 'payment' ? (
      <HubPaymentComposer person={person} />
    ) : person.composer === 'crate' ? (
      <HubCrateComposer person={person} />
    ) : null;
  const body =
    person.section === 'enrollment' ? (
      <HubEnrollment enrollment={person.enrollment} />
    ) : (
      <>
        {composer}
        <LedgerStatement months={person.months} freshIds={person.freshIds} />
      </>
    );

  return (
    <KkStepPane label={name} framed={framed}>
      <KkStepPane.Head
        icon="person"
        title={name}
        context={context}
        state={HEAD_STATES[rowState]}
        stateLabel={ROW_STATE_LABELS[rowState]}
        actions={actions}
      />
      <KkStepPane.Body>{body}</KkStepPane.Body>
      <HubPersonFoot person={person} firstName={line.person.firstName} />
      <KkConfirmDialog
        open={person.ending}
        onClose={person.closeEnd}
        onConfirm={person.confirmEnd}
        tone="danger"
        eyebrow={END_CONFIRM.eyebrow}
        question={END_CONFIRM.question}
        explanation={END_CONFIRM.explanation}
        facts={NO_FACTS}
        confirmLabel={END_CONFIRM.confirmLabel}
        cancelLabel={END_CONFIRM.cancelLabel}
        closeLabel={END_CONFIRM.closeLabel}
      />
    </KkStepPane>
  );
};
