import { KkButton } from '@furria/ui/KkButton';
import { KkNumberField } from '@furria/ui/KkNumberField';
import { KkPourDay } from '@furria/ui/KkPourDay';
import { KkText } from '@furria/ui/KkText';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import {
  cratesLabel,
  euroOf,
  OPEN_SECTION,
  PAY_COUNT_LABEL,
  PAY_OLDEST_NOTE,
  paymentButtonOf,
  STEP_LABELS,
} from '../beer-hub-copy';
import type { PaymentTarget } from '../hooks/use-payment-form';
import { usePaymentForm } from '../hooks/use-payment-form';
import { BeerCrateLine } from './BeerCrateLine';

interface BeerPaymentBlockProps {
  target: PaymentTarget;
  now: string;
  onDone: () => void;
}

export const BeerPaymentBlock: FC<BeerPaymentBlockProps> = ({ target, now, onDone }) => {
  const payment = usePaymentForm(target, onDone);
  const openCents = target.oldestFirst.reduce((sum, crate) => sum + crate.priceCents, 0);
  const openFacts = `${cratesLabel(target.oldestFirst.length)} · ${euroOf(openCents)}`;
  const buttonLabel = paymentButtonOf(payment.count, payment.preview.cents);
  const lines = target.oldestFirst.map((crate) => (
    <BeerCrateLine
      key={crate.crateId}
      crate={crate}
      now={now}
      marked={payment.preview.settledIds.has(crate.crateId)}
    />
  ));

  return (
    <Stack sx={{ gap: 1.5, minWidth: 0 }}>
      <Stack direction="row" sx={{ gap: 1, alignItems: 'flex-start' }}>
        <KkNumberField
          name="crateCount"
          label={PAY_COUNT_LABEL}
          value={payment.text}
          onChange={payment.setText}
          stepLabels={STEP_LABELS}
          min={1}
          max={target.oldestFirst.length}
          sx={{ flex: 1 }}
        />
        <KkText variant="caption" tone="secondary" sx={{ flex: 1, pt: 1 }}>
          {PAY_OLDEST_NOTE}
        </KkText>
      </Stack>
      <KkButton
        variant="contained"
        size="large"
        disabled={!payment.valid || payment.busy}
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
