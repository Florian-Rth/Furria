import { KkButton } from '@furria/ui/KkButton';
import { KkHoldButton } from '@furria/ui/KkHoldButton';
import { KkPourDay } from '@furria/ui/KkPourDay';
import { KkText } from '@furria/ui/KkText';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { PersonRef } from '@/lib/api/schemas';
import { useBeerHubContext } from '../beer-hub-context';
import {
  cratesLabel,
  END_LABEL,
  ENROLL_SECTION,
  endConfirmOf,
  FORM_TITLES,
  filterPersonLabelOf,
  HOLD_HINT,
  PAYMENTS_SECTION,
} from '../beer-hub-copy';
import { shortDateOf } from '../beer-time';
import type { BeerOpenHub } from '../hooks/use-beer-hub';
import type { PersonPane } from '../hooks/use-person-pane';
import type { BeerEnrollment } from '../schemas';
import { BeerPaymentBlock } from './BeerPaymentBlock';
import { BeerPaymentRow } from './BeerPaymentRow';
import { BeerTakenCrateRow } from './BeerTakenCrateRow';

const TAKEN_SECTION = 'Kisten';

const STAY_IN_PANE = (): undefined => undefined;

const enrollmentLineOf = (enrollment: BeerEnrollment | null): string => {
  if (enrollment === null) {
    return 'nimmt nicht teil';
  }

  const since = `nimmt teil seit ${shortDateOf(enrollment.startedAt)}`;

  if (enrollment.endedAt === null) {
    return since;
  }

  const by = enrollment.endedBy === null ? '' : ` von ${enrollment.endedBy.firstName}`;

  return `${since} · beendet am ${shortDateOf(enrollment.endedAt)}${by}`;
};

interface BeerPersonBodyProps {
  open: BeerOpenHub;
  person: PersonRef;
  pane: PersonPane;
}

export const BeerPersonBody: FC<BeerPersonBodyProps> = ({ open, person, pane }) => {
  const hub = useBeerHubContext();
  const name = person.firstName;
  const endConfirm = endConfirmOf(name);
  const target = { beerPotId: open.pot.beerPotId, person, oldestFirst: pane.oldestOpen };
  const paymentBlock =
    pane.oldestOpen.length === 0 ? null : (
      <BeerPaymentBlock
        key={pane.oldestOpen.length}
        target={target}
        now={hub.now}
        onDone={STAY_IN_PANE}
      />
    );
  const bookCrates = (): void => {
    hub.openPane('/manage/beer-list/crates', person.personId);
  };
  const filter = (): void => {
    hub.filterPerson(person.personId);
  };
  const takenLines = pane.taken.map((crate) => (
    <BeerTakenCrateRow key={crate.crateId} crate={crate} now={hub.now} />
  ));
  const paymentLines = pane.payments.map((payment) => (
    <BeerPaymentRow key={payment.beerPaymentId} payment={payment} />
  ));
  const enrollmentLine = enrollmentLineOf(pane.enrollment);
  const endButton =
    pane.enrollment !== null && pane.enrollment.endedAt === null ? (
      <KkHoldButton
        label={END_LABEL}
        hint={HOLD_HINT}
        tone="danger"
        confirm={endConfirm}
        onCommit={pane.end}
        disabled={pane.ending}
      />
    ) : null;
  const filterLabel = filterPersonLabelOf(name);
  const takenFacts = pane.taken.length === 0 ? '' : cratesLabel(pane.taken.length);

  return (
    <Stack sx={{ gap: 3, minWidth: 0 }}>
      {paymentBlock}
      <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
        <KkButton variant="outlined" onClick={bookCrates}>
          {FORM_TITLES.crates}
        </KkButton>
        <KkButton variant="text" onClick={filter}>
          {filterLabel}
        </KkButton>
      </Stack>
      <Stack>
        <KkPourDay label={TAKEN_SECTION} facts={takenFacts} />
        {takenLines}
      </Stack>
      <Stack>
        <KkPourDay label={PAYMENTS_SECTION} facts="" />
        {paymentLines}
      </Stack>
      <Stack sx={{ gap: 1 }}>
        <KkPourDay label={ENROLL_SECTION} facts="" />
        <KkText variant="body2" tone="secondary">
          {enrollmentLine}
        </KkText>
        {endButton}
      </Stack>
    </Stack>
  );
};
