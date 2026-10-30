import { KkMeta } from '@furria/ui/KkMeta';
import { KkStateGlyph } from '@furria/ui/KkStateGlyph';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import {
  CHECK_DONE,
  LEGEND_ADJUSTED,
  LEGEND_LABEL,
  LEGEND_PLACED,
  LEGEND_TRAY,
} from '../season-c-copy';
import { SeasonCLegendItem } from './SeasonCLegendItem';

export const SeasonCLegend: FC = () => (
  <Stack
    direction="row"
    component="ul"
    aria-label={LEGEND_LABEL}
    sx={{ columnGap: 2.5, rowGap: 0.5, flexWrap: 'wrap', m: 0, p: 0, pl: 1, listStyle: 'none' }}
  >
    <SeasonCLegendItem state="done" text={LEGEND_PLACED} />
    <SeasonCLegendItem state="open" text={LEGEND_TRAY} />
    <SeasonCLegendItem state="overdue" text={LEGEND_ADJUSTED} />
    <Stack component="li" direction="row" sx={{ alignItems: 'center', gap: 0.75 }}>
      <KkStateGlyph state="done" />
      <KkMeta>{CHECK_DONE}</KkMeta>
    </Stack>
  </Stack>
);
