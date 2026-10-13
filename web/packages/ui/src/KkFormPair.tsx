import Grid from '@mui/material/Grid';
import type { FC, ReactNode } from 'react';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

export type KkFormPairBalance = 'even' | 'leading' | 'trailing';
export type KkFormPairPhone = 'side' | 'stack';

interface PairSpans {
  start: number;
  end: number;
}

const PAIR_SPANS: Record<KkFormPairBalance, PairSpans> = {
  even: { start: 6, end: 6 },
  leading: { start: 8, end: 4 },
  trailing: { start: 4, end: 8 },
};

const FULL_ROW = 12;
const CELL_SX = { minWidth: 0 } as const;

const sizeOf = (span: number, phone: KkFormPairPhone): { xs: number; sm: number } => ({
  xs: phone === 'side' ? span : FULL_ROW,
  sm: span,
});

interface KkFormPairProps {
  start: ReactNode;
  end: ReactNode;
  balance?: KkFormPairBalance;
  phone?: KkFormPairPhone;
  sx?: KkSx;
}

export const KkFormPair: FC<KkFormPairProps> = ({
  start,
  end,
  balance = 'even',
  phone = 'stack',
  sx,
}) => {
  const spans = PAIR_SPANS[balance];
  const startSize = sizeOf(spans.start, phone);
  const endSize = sizeOf(spans.end, phone);

  return (
    <Grid
      container
      spacing={kkTokens.form.fieldGap}
      data-kk-form-pair={balance}
      sx={[CELL_SX, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Grid size={startSize} sx={CELL_SX}>
        {start}
      </Grid>
      <Grid size={endSize} sx={CELL_SX}>
        {end}
      </Grid>
    </Grid>
  );
};
