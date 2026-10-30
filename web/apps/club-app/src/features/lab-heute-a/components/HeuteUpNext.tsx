import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { AFTER_LABEL, NEXT_LABEL, NO_MORE, NOTHING_NEXT } from '../heute-a-copy';
import type { HeuteA } from '../hooks/use-heute-a';
import { HeuteCallList } from './HeuteCallList';
import { HeuteUpCard } from './HeuteUpCard';

const CARD_SIZE = { xs: 12, sm: 6 } as const;

interface HeuteUpNextProps {
  heute: HeuteA;
}

export const HeuteUpNext: FC<HeuteUpNextProps> = ({ heute }) => (
  <Stack
    sx={{
      width: '100%',
      height: '100%',
      gap: 1.5,
      minHeight: 0,
      overflowY: 'auto',
      overscrollBehavior: 'contain',
    }}
  >
    <Grid container spacing={1.5} sx={{ flexShrink: 0 }}>
      <Grid size={CARD_SIZE}>
        <HeuteUpCard label={NEXT_LABEL} line={heute.flow.next} emptyText={NO_MORE} />
      </Grid>
      <Grid size={CARD_SIZE}>
        <HeuteUpCard label={AFTER_LABEL} line={heute.flow.after} emptyText={NOTHING_NEXT} />
      </Grid>
    </Grid>
    <HeuteCallList heute={heute} />
  </Stack>
);
