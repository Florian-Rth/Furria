import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren, ReactNode } from 'react';

interface KkStudioAManualGroupProps extends PropsWithChildren {
  head: ReactNode;
}

export const KkStudioAManualGroup: FC<KkStudioAManualGroupProps> = ({ head, children }) => (
  <Stack
    component="li"
    sx={(theme) => ({
      listStyle: 'none',
      '& + &': { borderTop: `${2}px solid ${(theme.vars ?? theme).palette.divider}` },
    })}
  >
    {head}
    <Stack component="ol" sx={{ m: 0, p: 0 }}>
      {children}
    </Stack>
  </Stack>
);
