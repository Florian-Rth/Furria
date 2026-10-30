import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface KkLaneCardsChipsProps extends PropsWithChildren {
  label: string;
}

export const KkLaneCardsChips: FC<KkLaneCardsChipsProps> = ({ label, children }) => (
  <Stack
    direction="row"
    role="toolbar"
    aria-label={label}
    sx={{
      flexShrink: 0,
      gap: 0.5,
      overflowX: 'auto',
      scrollbarWidth: 'none',
      mx: -1.25,
      px: 1.25,
      '&::-webkit-scrollbar': { display: 'none' },
    }}
  >
    {children}
  </Stack>
);
