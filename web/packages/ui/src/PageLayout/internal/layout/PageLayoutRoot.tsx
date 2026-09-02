import Stack from '@mui/material/Stack';
import type { SxProps, Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';

interface PageLayoutRootProps extends PropsWithChildren {
  sx?: SxProps<Theme>;
}

export const PageLayoutRoot: FC<PageLayoutRootProps> = ({ sx, children }) => (
  <Stack
    component="main"
    data-kk-page
    sx={[{ flex: 1, overflowX: 'clip' }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {children}
  </Stack>
);
