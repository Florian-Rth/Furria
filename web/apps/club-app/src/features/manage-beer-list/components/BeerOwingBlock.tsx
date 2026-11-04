import { KkPourDay } from '@furria/ui/KkPourDay';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { WriteLanding } from '@/features/write/landing-target';
import { openCentsOf } from '../beer-hub';
import { useBeerHubContext } from '../beer-hub-context';
import { fullNameOf, openFactsOf } from '../beer-hub-copy';
import type { PaymentTarget } from '../hooks/use-payment-form';
import { BeerPaymentBlock } from './BeerPaymentBlock';

interface BeerOwingBlockProps {
  target: PaymentTarget;
  landing: WriteLanding;
}

export const BeerOwingBlock: FC<BeerOwingBlockProps> = ({ target, landing }) => {
  const { now } = useBeerHubContext();
  const name = fullNameOf(target.person);
  const facts = openFactsOf(target.oldestFirst.length, openCentsOf(target.oldestFirst));
  const blockKey = target.oldestFirst.length;

  return (
    <Stack sx={{ gap: 1 }}>
      <KkPourDay label={name} facts={facts} />
      <BeerPaymentBlock key={blockKey} target={target} now={now} landing={landing} />
    </Stack>
  );
};
