import { KkButton } from '@furria/ui/KkButton';
import { KkHoldButton } from '@furria/ui/KkHoldButton';
import { KkPourDay } from '@furria/ui/KkPourDay';
import { KkStepPane } from '@furria/ui/KkStepPane';
import { KkText } from '@furria/ui/KkText';
import type { KkStepState } from '@furria/ui/step-state';
import Stack from '@mui/material/Stack';
import type { FC, ReactNode } from 'react';
import { labBeerPersonOf } from '@/features/lab-beer/beer-lab-fixture';
import { euroOf } from '@/features/lab-beer/beer-lab-ledger';
import type { LabBeerWorld } from '@/features/lab-beer/beer-lab-types';
import { cratesLabel, daysLabel, fullNameOf } from '../pour-copy';
import type { PourPerson, PourPersonState } from '../pour-hub';
import { pourPersonOf } from '../pour-hub';
import {
  END_HINT,
  END_LABEL,
  ENROLL_SECTION,
  endConfirmOf,
  filterPersonLabelOf,
  nameOf,
  PAID_SECTION,
} from '../pour-hub-copy';
import { shortDateOf } from '../pour-time';
import { PourOpenCrateLine } from './PourOpenCrateLine';
import { PourPaymentBlock } from './PourPaymentBlock';

const PANE_STATES: Record<PourPersonState, KkStepState> = {
  overdue: 'overdue',
  open: 'current',
  paid: 'done',
};

interface PourPersonPaneProps {
  world: LabBeerWorld;
  personId: number;
  framed: boolean;
  actions: ReactNode;
  onPay: (personId: number, crateCount: number) => void;
  onEnd: (personId: number) => void;
  onFilter: (personId: number) => void;
}

const enrollmentLineOf = (world: LabBeerWorld, personId: number): string => {
  const enrollment = world.enrollments.findLast((item) => item.personId === personId);

  if (enrollment === undefined) {
    return 'nimmt nicht teil';
  }

  const since = `nimmt teil seit ${shortDateOf(enrollment.startedAt)}`;

  return enrollment.endedAt === null
    ? since
    : `${since} · beendet am ${shortDateOf(enrollment.endedAt)} von ${nameOf(enrollment.endedById)}`;
};

const contextOf = (person: PourPerson): string =>
  person.tab.openCount > 0
    ? `${cratesLabel(person.tab.openCount)} offen · ${daysLabel(person.openDays ?? 0)}`
    : 'alles bezahlt';

export const PourPersonPane: FC<PourPersonPaneProps> = ({
  world,
  personId,
  framed,
  actions,
  onPay,
  onEnd,
  onFilter,
}) => {
  const person = pourPersonOf(world, personId);
  const name = fullNameOf(labBeerPersonOf(personId));
  const { tab } = person;
  const open = tab.openCount > 0;
  const context = contextOf(person);
  const stateLabel = open ? `${euroOf(tab.openCents)} offen` : 'bezahlt';
  const confirm = endConfirmOf(nameOf(personId));
  const pay = (crateCount: number): void => {
    onPay(personId, crateCount);
  };
  const end = (): void => {
    onEnd(personId);
  };
  const filter = (): void => {
    onFilter(personId);
  };
  const filterLabel = filterPersonLabelOf(nameOf(personId));
  const paymentBlock = open ? (
    <PourPaymentBlock key={`${personId}-${tab.openCount}`} tab={tab} now={world.now} onBook={pay} />
  ) : null;
  const paidFacts =
    person.paidNewestFirst.length === 0 ? '' : cratesLabel(person.paidNewestFirst.length);
  const paidLines = person.paidNewestFirst.map((entry) => (
    <PourOpenCrateLine key={entry.crate.id} entry={entry} now={world.now} />
  ));
  const enrollmentLine = enrollmentLineOf(world, personId);
  const endButton = person.enrolled ? (
    <KkHoldButton
      label={END_LABEL}
      hint={END_HINT}
      tone="danger"
      confirm={confirm}
      onCommit={end}
    />
  ) : null;

  return (
    <KkStepPane label={name} framed={framed}>
      <KkStepPane.Head
        icon="person"
        title={name}
        context={context}
        state={PANE_STATES[person.state]}
        stateLabel={stateLabel}
        actions={actions}
      />
      <KkStepPane.Body>
        <Stack sx={{ gap: 3, minWidth: 0 }}>
          {paymentBlock}
          <KkButton variant="outlined" onClick={filter}>
            {filterLabel}
          </KkButton>
          <Stack>
            <KkPourDay label={PAID_SECTION} facts={paidFacts} />
            {paidLines}
          </Stack>
          <Stack sx={{ gap: 1 }}>
            <KkPourDay label={ENROLL_SECTION} facts="" />
            <KkText variant="body2" tone="secondary">
              {enrollmentLine}
            </KkText>
            {endButton}
          </Stack>
        </Stack>
      </KkStepPane.Body>
    </KkStepPane>
  );
};
