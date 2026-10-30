import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface KkWayRibbonRootProps extends PropsWithChildren {
  label: string;
}

export const KkWayRibbonRoot: FC<KkWayRibbonRootProps> = ({ label, children }) => (
  <Box
    role="group"
    aria-label={label}
    data-kk-way-ribbon
    data-kk-practice-rail
    sx={{
      width: '100%',
      minWidth: 0,
      overflowX: 'auto',
      overflowY: 'clip',
      overscrollBehaviorX: 'contain',
      scrollbarWidth: 'none',
      '&::-webkit-scrollbar': { display: 'none' },
    }}
  >
    <Stack direction="row" sx={{ minWidth: '100%', width: 'max-content', gap: 1.5 }}>
      {children}
    </Stack>
  </Box>
);
