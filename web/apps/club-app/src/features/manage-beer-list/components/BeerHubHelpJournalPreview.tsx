import { KkFilterChips } from '@furria/ui/KkFilterChips';
import type { KkPourJournalPerson } from '@furria/ui/KkPourJournalRow';
import { KkPourJournalRow } from '@furria/ui/KkPourJournalRow';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { euroOf, KIND_FILTER_LABEL, KIND_LABELS, KIND_ORDER } from '../beer-hub-copy';

const keep = (): void => {};

const KIND_OPTIONS = KIND_ORDER.map((kind) => ({ id: kind, label: KIND_LABELS[kind] }));
const ANNA: KkPourJournalPerson = { name: 'Anna', onSelect: keep };
const JONAS: KkPourJournalPerson = { name: 'Jonas', onSelect: keep };
const PAID_AMOUNT = euroOf(3600);
const CRATE_AMOUNT = euroOf(1800);

export const BeerHubHelpJournalPreview: FC = () => (
  <Stack sx={{ gap: 1, minWidth: 0 }}>
    <KkFilterChips label={KIND_FILTER_LABEL} options={KIND_OPTIONS} value="all" onChange={keep} />
    <Stack>
      <KkPourJournalRow
        kind="payment"
        time="19:40"
        person={ANNA}
        text="zahlt 2 Kisten Veltins"
        note={null}
        amount={PAID_AMOUNT}
        delta={null}
        deltaTone="none"
        struck={false}
        selected={false}
      />
      <KkPourJournalRow
        kind="crate"
        time="18:05"
        person={JONAS}
        text="1 Kiste Veltins"
        note={null}
        amount={CRATE_AMOUNT}
        delta="−1"
        deltaTone="out"
        struck={false}
        selected={false}
      />
      <KkPourJournalRow
        kind="delivery"
        time="17:30"
        person={null}
        text="Lieferung · 5 Kisten Veltins"
        note={null}
        amount={null}
        delta="+5"
        deltaTone="in"
        struck={false}
        selected={false}
      />
    </Stack>
  </Stack>
);
