import { KkButton } from '@furria/ui/KkButton';
import { KkHoldButton } from '@furria/ui/KkHoldButton';
import { KkPourDay } from '@furria/ui/KkPourDay';
import { KkText } from '@furria/ui/KkText';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { PersonRef } from '@/lib/api/schemas';
import { useBeerHubContext } from '../beer-hub-context';
import {
  END_LABEL,
  ENROLL_SECTION,
  endConfirmOf,
  enrollmentLineOf,
  FORM_TITLES,
  filterPersonLabelOf,
  HOLD_HINT,
  PAYMENTS_SECTION,
  TAKEN_SECTION,
  takenFactsOf,
} from '../beer-hub-copy';
import { personLandingOf } from '../beer-landing';
import type { BeerOpenHub } from '../hooks/use-beer-hub';
import type { PersonPane } from '../hooks/use-person-pane';
import { BeerPaymentBlock } from './BeerPaymentBlock';
import { BeerPaymentRow } from './BeerPaymentRow';
import { BeerTakenCrateRow } from './BeerTakenCrateRow';

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
  const landing = personLandingOf(person.personId);
  const paymentKey = pane.oldestOpen.length;
  const paymentBlock =
    pane.oldestOpen.length === 0 ? null : (
      <BeerPaymentBlock key={paymentKey} target={target} now={hub.now} landing={landing} />
    );
  const bookCrates = (): void => {
    hub.openPane('/beer-list/manage/crates', person.personId);
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
  const endButton = pane.canEnd ? (
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
  const takenFacts = takenFactsOf(pane.taken.length);

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
