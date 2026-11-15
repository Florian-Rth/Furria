import { KkButton } from '@furria/ui/KkButton';
import { KkPillButton } from '@furria/ui/KkPillButton';
import { KkPourDay } from '@furria/ui/KkPourDay';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { WriteLanding } from '@/features/write/landing-target';
import { openCentsOf } from '../beer-hub';
import { OPEN_SECTION, openFactsOf, PAY_ALL_LABEL, paymentButtonOf } from '../beer-hub-copy';
import type { PaymentTarget } from '../hooks/use-payment-form';
import { usePaymentForm } from '../hooks/use-payment-form';
import { BeerCrateLine } from './BeerCrateLine';
import { BeerPaymentDrinkStep } from './BeerPaymentDrinkStep';
import { BeerRejection } from './BeerRejection';

interface BeerPaymentBlockProps {
  target: PaymentTarget;
  now: string;
  landing: WriteLanding;
}

export const BeerPaymentBlock: FC<BeerPaymentBlockProps> = ({ target, now, landing }) => {
  const payment = usePaymentForm(target, landing);
  const openFacts = openFactsOf(target.oldestFirst.length, openCentsOf(target.oldestFirst));
  const buttonLabel = paymentButtonOf(payment.preview.cents);
  const cannotSubmit = !payment.canSubmit;
  const steps = payment.preview.drinks.map((drink) => (
    <BeerPaymentDrinkStep key={drink.beerDrinkId} drink={drink} onStep={payment.step} />
  ));
  const lines = payment.preview.lines.map((line) => (
    <BeerCrateLine key={line.crate.crateId} crate={line.crate} now={now} marked={line.settled} />
  ));

  return (
    <Stack sx={{ gap: 1.5, minWidth: 0 }}>
      <Stack sx={{ gap: 0.5, minWidth: 0 }}>{steps}</Stack>
      <BeerRejection rejection={payment.rejection} />
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1, minWidth: 0 }}>
        <KkPillButton
          text={PAY_ALL_LABEL}
          pressed={payment.preview.full}
          onPress={payment.payAll}
        />
        <KkButton
          variant="contained"
          size="large"
          disabled={cannotSubmit}
          loading={payment.isSaving}
          onClick={payment.submit}
          sx={{ flex: 1, minWidth: 0 }}
        >
          {buttonLabel}
        </KkButton>
      </Stack>
      <Stack>
        <KkPourDay label={OPEN_SECTION} facts={openFacts} />
        {lines}
      </Stack>
    </Stack>
  );
};
