import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface KkEightsBarRootProps extends PropsWithChildren {
  label: string;
}

export const KkEightsBarRoot: FC<KkEightsBarRootProps> = ({ label, children }) => (
  <Stack
    direction="row"
    role="toolbar"
    aria-label={label}
    data-kk-eights-bar
    sx={{
      alignItems: 'center',
      gap: 0.75,
      minWidth: 0,
      minHeight: '2.75rem',
      overflowX: 'auto',
      scrollbarWidth: 'none',
    }}
  >
    {children}
  </Stack>
);
