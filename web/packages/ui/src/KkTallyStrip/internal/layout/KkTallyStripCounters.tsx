import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface KkTallyStripCountersProps extends PropsWithChildren {
  label: string;
}

export const KkTallyStripCounters: FC<KkTallyStripCountersProps> = ({ label, children }) => (
  <Stack
    direction="row"
    role="radiogroup"
    aria-label={label}
    data-kk-tally-strip-counters
    sx={{
      flex: { xs: '0 0 auto', md: 1 },
      ml: { xs: 'auto', md: 0 },
      minWidth: 0,
      alignItems: 'center',
      justifyContent: { xs: 'space-between', md: 'flex-end' },
      gap: { xs: 0.25, md: 0.75 },
    }}
  >
    {children}
  </Stack>
);
