import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkAnswerRollRootProps extends PropsWithChildren {
  label: string;
  sx?: KkSx;
}

export const KkAnswerRollRoot: FC<KkAnswerRollRootProps> = ({ label, sx, children }) => (
  <Stack
    component="ul"
    aria-label={label}
    data-kk-answer-roll
    sx={[
      { minWidth: 0, gap: 0.5, m: 0, p: 0, listStyle: 'none' },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);
