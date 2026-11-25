import { KkPourDay } from '@furria/ui/KkPourDay';
import { KkPourRosterRow } from '@furria/ui/KkPourRosterRow';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { euroOf, openCountOf, ROSTER_LABEL } from '../beer-hub-copy';

const SAMPLE_TOTAL = euroOf(5400);
const ANNA_AMOUNT = euroOf(3600);
const ANNA_COUNT = openCountOf(2);
const JONAS_AMOUNT = euroOf(1800);
const JONAS_COUNT = openCountOf(1);

const keep = (): void => {};

export const BeerHubHelpRosterPreview: FC = () => (
  <Stack>
    <KkPourDay label={ROSTER_LABEL} facts={SAMPLE_TOTAL} />
    <KkPourRosterRow
      initials="AB"
      name="Anna Becker"
      state="open"
      facts="seit 3 Tagen · 4 Kisten bezahlt"
      amount={ANNA_AMOUNT}
      count={ANNA_COUNT}
      selected={false}
      onSelect={keep}
    />
    <KkPourRosterRow
      initials="JK"
      name="Jonas Klein"
      state="open"
      facts="seit gestern · 1 Kiste bezahlt"
      amount={JONAS_AMOUNT}
      count={JONAS_COUNT}
      selected={false}
      onSelect={keep}
    />
  </Stack>
);
