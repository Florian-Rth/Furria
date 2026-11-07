import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface KkEjToolBarRootProps extends PropsWithChildren {
  label: string;
}

export const KkEjToolBarRoot: FC<KkEjToolBarRootProps> = ({ label, children }) => (
  <Stack
    direction="row"
    role="toolbar"
    aria-label={label}
    data-kk-ej-tool-bar
    sx={{ minWidth: 0, gap: 0.5, '& > *': { flex: '1 1 0', minWidth: 0 } }}
  >
    {children}
  </Stack>
);
