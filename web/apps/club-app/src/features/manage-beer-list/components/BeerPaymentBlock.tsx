import { KkButton } from '@furria/ui/KkButton';
import { KkNumberField } from '@furria/ui/KkNumberField';
import { KkPourDay } from '@furria/ui/KkPourDay';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { WriteLanding } from '@/features/write/landing-target';
import { openCentsOf } from '../beer-hub';
import {
  OPEN_SECTION,
  openFactsOf,
  PAY_COUNT_LABEL,
  paymentButtonOf,
  STEP_LABELS,
} from '../beer-hub-copy';
import type { PaymentTarget } from '../hooks/use-payment-form';
import { usePaymentForm } from '../hooks/use-payment-form';
import { BeerCrateLine } from './BeerCrateLine';
import { BeerRejection } from './BeerRejection';

interface BeerPaymentBlockProps {
  target: PaymentTarget;
  now: string;
  landing: WriteLanding;
}

export const BeerPaymentBlock: FC<BeerPaymentBlockProps> = ({ target, now, landing }) => {
  const payment = usePaymentForm(target, landing);
  const openFacts = openFactsOf(target.oldestFirst.length, openCentsOf(target.oldestFirst));
  const buttonLabel = paymentButtonOf(payment.count, payment.preview.cents);
  const hasError = payment.cratesError !== undefined;
  const lines = payment.preview.lines.map((line) => (
    <BeerCrateLine key={line.crate.crateId} crate={line.crate} now={now} marked={line.settled} />
  ));

  return (
    <Stack sx={{ gap: 1.5, minWidth: 0 }}>
      <KkNumberField
        name="crates"
        label={PAY_COUNT_LABEL}
        value={payment.cratesText}
        onChange={payment.setCratesText}
        stepLabels={STEP_LABELS}
        min={1}
        max={target.oldestFirst.length}
        error={hasError}
        helperText={payment.cratesError}
      />
      <BeerRejection rejection={payment.rejection} />
      <KkButton
        variant="contained"
        size="large"
        disabled={!payment.canSubmit}
        loading={payment.isSaving}
        onClick={payment.submit}
      >
        {buttonLabel}
      </KkButton>
      <Stack>
        <KkPourDay label={OPEN_SECTION} facts={openFacts} />
        {lines}
      </Stack>
    </Stack>
  );
};
