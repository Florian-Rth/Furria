import Grid from '@mui/material/Grid';
import type { FC, ReactNode } from 'react';

const TILE_SPACING = 1.5;
const FULL = 12;
const LEAD_SPAN = { xs: FULL, lg: 5 } as const;
const STRIP_SPAN = { xs: FULL, lg: 7 } as const;
const WIDE_ONLY = { display: { xs: 'none', lg: 'block' } } as const;
const ROW = { alignItems: 'stretch' } as const;

interface StartHeaderRowProps {
  lead: ReactNode;
  strip: ReactNode;
}

export const StartHeaderRow: FC<StartHeaderRowProps> = ({ lead, strip }) => {
  const leadSpan = strip === null ? FULL : LEAD_SPAN;
  const stripCell =
    strip === null ? null : (
      <Grid size={STRIP_SPAN} sx={WIDE_ONLY}>
        {strip}
      </Grid>
    );

  return (
    <Grid container spacing={TILE_SPACING} sx={ROW}>
      <Grid size={leadSpan}>{lead}</Grid>
      {stripCell}
    </Grid>
  );
};
