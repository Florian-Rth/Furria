import Stack from '@mui/material/Stack';
import type { SxProps, Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';

interface MatcherStepFooterProps extends PropsWithChildren {
  sx?: SxProps<Theme>;
}

export const MatcherStepFooter: FC<MatcherStepFooterProps> = ({ sx, children }) => (
  <Stack
    direction="row"
    sx={[
      { alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);
