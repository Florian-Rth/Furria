import { KkButton } from '@furria/ui/KkButton';
import { KkNumberField } from '@furria/ui/KkNumberField';
import { KkPourDay } from '@furria/ui/KkPourDay';
import { KkText } from '@furria/ui/KkText';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { euroOf } from '@/features/lab-beer/beer-lab-ledger';
import type { LabBeerTab } from '@/features/lab-beer/beer-lab-types';
import { usePourPaymentCount } from '../hooks/use-pour-payment-count';
import { cratesLabel } from '../pour-copy';
import {
  OPEN_SECTION,
  PAY_COUNT_LABEL,
  PAY_OLDEST_NOTE,
  paymentButtonOf,
  STEP_LABELS,
} from '../pour-hub-copy';
import { PourOpenCrateLine } from './PourOpenCrateLine';

interface PourPaymentBlockProps {
  tab: LabBeerTab;
  now: string;
  onBook: (crateCount: number) => void;
}

export const PourPaymentBlock: FC<PourPaymentBlockProps> = ({ tab, now, onBook }) => {
  const payment = usePourPaymentCount(tab);
  const openFacts = `${cratesLabel(tab.openCount)} · ${euroOf(tab.openCents)}`;
  const buttonLabel = paymentButtonOf(payment.count, payment.preview.cents);
  const book = (): void => {
    onBook(payment.count);
  };
  const lines = tab.crates
    .filter((entry) => entry.paidBy === null)
    .map((entry) => (
      <PourOpenCrateLine
        key={entry.crate.id}
        entry={entry}
        now={now}
        marked={payment.markedIds.has(entry.crate.id)}
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
          max={tab.openCount}
          sx={{ flex: 1 }}
        />
        <KkText variant="caption" tone="secondary" sx={{ flex: 1, pt: 1 }}>
          {PAY_OLDEST_NOTE}
        </KkText>
      </Stack>
      <KkButton variant="contained" size="large" disabled={!payment.valid} onClick={book}>
        {buttonLabel}
      </KkButton>
      <Stack>
        <KkPourDay label={OPEN_SECTION} facts={openFacts} />
        {lines}
      </Stack>
    </Stack>
  );
};
