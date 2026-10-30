import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface KkFocusCardsRowProps extends PropsWithChildren {
  label: string;
}

export const KkFocusCardsRow: FC<KkFocusCardsRowProps> = ({ label, children }) => (
  <Stack
    direction="row"
    role="toolbar"
    aria-label={label}
    sx={{
      alignItems: 'center',
      gap: 0.5,
      minWidth: 0,
      overflowX: 'auto',
      scrollbarWidth: 'none',
    }}
  >
    {children}
  </Stack>
);
