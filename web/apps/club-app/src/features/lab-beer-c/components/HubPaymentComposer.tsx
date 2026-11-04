import { KkEyebrow } from '@furria/ui/KkEyebrow';
import type { KkLedgerReceiptLine } from '@furria/ui/KkLedgerReceipt';
import { KkLedgerReceipt } from '@furria/ui/KkLedgerReceipt';
import { KkLedgerStepper } from '@furria/ui/KkLedgerStepper';
import { KkText } from '@furria/ui/KkText';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { euroOf } from '@/features/lab-beer/beer-lab-ledger';
import type { HubPerson } from '../hooks/use-hub-person';
import {
  crateUnit,
  LESS_LABEL,
  MORE_LABEL,
  PAYMENT_EXPLAIN,
  PAYMENT_TITLE,
  paymentRest,
  RECEIPT_SUM,
  SETTLES_LABEL,
} from '../ledger-copy';
import { dayOf } from '../ledger-format';

interface HubPaymentComposerProps {
  person: HubPerson;
}

export const HubPaymentComposer: FC<HubPaymentComposerProps> = ({ person }) => {
  const { settlement } = person;
  const unit = crateUnit(person.payCount);
  const lines: readonly KkLedgerReceiptLine[] = [
    ...settlement.crates.map((entry) => ({
      key: String(entry.crate.id),
      label: dayOf(entry.crate.bookedAt),
      value: euroOf(entry.crate.priceCents),
    })),
    { key: 'sum', label: RECEIPT_SUM, value: euroOf(settlement.cents), total: true },
  ];
  const rest = paymentRest(settlement.remainingCount);

  return (
    <Stack component="section" aria-label={PAYMENT_TITLE} sx={{ gap: 1.25, minWidth: 0 }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Stack sx={{ minWidth: 0 }}>
          <KkEyebrow>{PAYMENT_TITLE}</KkEyebrow>
          <KkText variant="caption" tone="secondary">
            {PAYMENT_EXPLAIN}
          </KkText>
        </Stack>
        <KkLedgerStepper
          value={person.payCount}
          min={1}
          max={person.tab.openCount}
          unit={unit}
          lessLabel={LESS_LABEL}
          moreLabel={MORE_LABEL}
          onChange={person.setPayCount}
        />
      </Stack>
      <KkEyebrow tone="muted">{SETTLES_LABEL}</KkEyebrow>
      <KkLedgerReceipt label={SETTLES_LABEL} lines={lines} />
      <KkText variant="caption" tone="secondary">
        {rest}
      </KkText>
    </Stack>
  );
};
