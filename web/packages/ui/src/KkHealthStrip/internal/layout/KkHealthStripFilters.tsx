import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface KkHealthStripFiltersProps extends PropsWithChildren {
  label: string;
}

export const KkHealthStripFilters: FC<KkHealthStripFiltersProps> = ({ label, children }) => (
  <Box data-kk-health-strip-filters sx={{ flex: 1, minWidth: 0, py: 1, px: { xs: 0, md: 1 } }}>
    <Stack
      direction="row"
      role="radiogroup"
      aria-label={label}
      sx={{
        alignItems: 'center',
        gap: 0.75,
        px: { xs: 1.5, md: 0.5 },
        flexWrap: 'wrap',
        rowGap: 0.75,
      }}
    >
      {children}
    </Stack>
  </Box>
);
