import { KkAlert } from '@furria/ui/KkAlert';
import { KkMeta } from '@furria/ui/KkMeta';
import { KkNote } from '@furria/ui/KkNote';
import { KkNumberField } from '@furria/ui/KkNumberField';
import { KkTabDisc } from '@furria/ui/KkTabDisc';
import { KkTabFigure } from '@furria/ui/KkTabFigure';
import { KkTabHold } from '@furria/ui/KkTabHold';
import { KkTabLedger } from '@furria/ui/KkTabLedger';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { LabBeerRefusal } from '@/features/lab-beer/beer-lab-actions';
import { euroOf, openDaysOf, REMINDER_AFTER_DAYS } from '@/features/lab-beer/beer-lab-ledger';
import type { LabBeerPerson, LabBeerTab } from '@/features/lab-beer/beer-lab-types';
import {
  CRATE_LINE,
  cratesLabel,
  discLabel,
  FORMER_PAYMENT_NOTE,
  OPEN_LABEL,
  openSinceLabel,
  PAYMENT_COUNT,
  PAYMENT_HINT,
  paidBefore,
  paymentBook,
  paymentConfirm,
  REFUSALS,
  SETTLES_HEAD,
  SETTLES_LABEL,
  STAYS_HEAD,
  STEP_LABELS,
} from '../beer-a-copy';
import { dayOf, nameOf, shortDayOf } from '../beer-a-format';
import { tabStrokesOf } from '../beer-a-tab';
import { usePaymentDraft } from '../hooks/use-payment-draft';

interface BeerHubAPaymentPaneProps {
  tab: LabBeerTab;
  person: LabBeerPerson | null;
  enrolled: boolean;
  lastPaidAt: string | null;
  now: string;
  pay: (personId: number, count: number) => LabBeerRefusal | null;
}

export const BeerHubAPaymentPane: FC<BeerHubAPaymentPaneProps> = ({
  tab,
  person,
  enrolled,
  lastPaidAt,
  now,
  pay,
}) => {
  const draft = usePaymentDraft(tab, pay);
  const name = nameOf(person);
  const openDays = openDaysOf(tab.oldestOpenAt, now) ?? 0;
  const attention = openDays >= REMINDER_AFTER_DAYS ? openSinceLabel(openDays) : null;
  const amount = euroOf(draft.plan.cents);
  const settleLines = draft.plan.settles.map((entry) => (
    <KkTabLedger.Line
      key={entry.crate.id}
      state="settles"
      day={dayOf(entry.crate.bookedAt)}
      label={CRATE_LINE}
      amount={euroOf(entry.crate.priceCents)}
    />
  ));
  const stayLines = draft.plan.stays.map((entry) => (
    <KkTabLedger.Line
      key={entry.crate.id}
      state="stays"
      day={dayOf(entry.crate.bookedAt)}
      label={CRATE_LINE}
      amount={euroOf(entry.crate.priceCents)}
    />
  ));
  const staysHead =
    stayLines.length === 0 ? null : (
      <KkTabLedger.Head
        key="stays"
        title={STAYS_HEAD}
        meta={cratesLabel(stayLines.length)}
        amount={euroOf(tab.openCents - draft.plan.cents)}
      />
    );
  const formerNote = enrolled ? null : <KkNote icon="info">{FORMER_PAYMENT_NOTE}</KkNote>;
  const refusal =
    draft.refusal === null ? null : <KkAlert severity="warning">{REFUSALS[draft.refusal]}</KkAlert>;
  const history =
    lastPaidAt === null ? null : (
      <KkMeta>{paidBefore(tab.paidCount, shortDayOf(lastPaidAt))}</KkMeta>
    );

  return (
    <Stack sx={{ gap: 2, minWidth: 0 }}>
      <Stack direction="row" sx={{ gap: 2, alignItems: 'center', minWidth: 0 }}>
        <KkTabDisc
          strokes={tabStrokesOf(tab, now, [])}
          label={discLabel(tab.openCount, tab.paidCount)}
          size="small"
        />
        <KkTabFigure
          label={OPEN_LABEL}
          value={euroOf(tab.openCents)}
          detail={cratesLabel(tab.openCount)}
          attention={attention}
          size="small"
          sx={{ flex: 1 }}
        />
      </Stack>
      {formerNote}
      <KkNumberField
        name="payment-count"
        label={PAYMENT_COUNT}
        value={draft.countText}
        onChange={draft.changeCount}
        stepLabels={STEP_LABELS}
        min={1}
        max={tab.openCount}
      />
      <KkTabLedger label={SETTLES_LABEL}>
        <KkTabLedger.Head
          key="settles"
          title={SETTLES_HEAD}
          meta={cratesLabel(settleLines.length)}
          amount={amount}
        />
        {settleLines}
        {staysHead}
        {stayLines}
      </KkTabLedger>
      {refusal}
      <KkTabHold
        label={paymentBook(amount)}
        hint={PAYMENT_HINT}
        confirm={paymentConfirm(name, draft.count, amount)}
        disabled={draft.count === 0}
        onCommit={draft.book}
      />
      {history}
    </Stack>
  );
};
