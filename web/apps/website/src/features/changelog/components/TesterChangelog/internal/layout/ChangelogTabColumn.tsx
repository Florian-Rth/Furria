import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';

interface ChangelogTabColumnProps extends PropsWithChildren {
  sx?: SxProps<Theme>;
}

export const ChangelogTabColumn: FC<ChangelogTabColumnProps> = ({ sx, children }) => (
  <Box
    data-kk-changelog-tabs
    sx={[
      {
        flexShrink: 0,
        minWidth: 0,
        width: { desktop: '33%' },
        pr: { desktop: 2 },
        borderRight: { desktop: 1 },
        borderColor: 'divider',
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Box>
);
