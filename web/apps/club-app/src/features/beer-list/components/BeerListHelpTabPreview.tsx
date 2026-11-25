import { KkTabDisc } from '@furria/ui/KkTabDisc';
import { KkTabFigure } from '@furria/ui/KkTabFigure';
import type { KkTabStrokeState } from '@furria/ui/tab-strokes';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { formatEuroCents } from '@/lib/money';
import { openDetail } from '../beer-list-copy';
import { discLabel, OPEN_TOTAL_LABEL } from '../booking/booking-copy';

const SAMPLE_STROKES: readonly KkTabStrokeState[] = ['paid', 'paid', 'paid', 'open', 'open'];
const SAMPLE_OPEN_CENTS = 3600;
const SAMPLE_DETAIL = openDetail(2, '14.11.');
const SAMPLE_DISC_LABEL = discLabel(2, 3);
const SAMPLE_AMOUNT = formatEuroCents(SAMPLE_OPEN_CENTS);

export const BeerListHelpTabPreview: FC = () => (
  <Stack direction="row" sx={{ alignItems: 'center', gap: 2, minWidth: 0 }}>
    <KkTabDisc strokes={SAMPLE_STROKES} label={SAMPLE_DISC_LABEL} />
    <KkTabFigure
      label={OPEN_TOTAL_LABEL}
      value={SAMPLE_AMOUNT}
      detail={SAMPLE_DETAIL}
      sx={{ flex: 1 }}
    />
  </Stack>
);
