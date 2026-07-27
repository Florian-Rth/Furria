import Stack from '@mui/material/Stack';
import type { SxProps, Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';

interface ChangelogPanelColumnProps extends PropsWithChildren {
  sx?: SxProps<Theme>;
}

export const ChangelogPanelColumn: FC<ChangelogPanelColumnProps> = ({ sx, children }) => (
  <Stack
    data-kk-changelog-panel
    sx={[
      { flexGrow: 1, minWidth: 0, gap: { xs: 1, desktop: 2 } },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);
