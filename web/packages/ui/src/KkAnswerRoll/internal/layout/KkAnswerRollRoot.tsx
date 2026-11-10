import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkAnswerRollRootProps extends PropsWithChildren {
  label: string;
  sx?: KkSx;
}

export const KkAnswerRollRoot: FC<KkAnswerRollRootProps> = ({ label, sx, children }) => (
  <Stack
    role="group"
    aria-label={label}
    data-kk-answer-roll
    sx={[{ minWidth: 0, gap: 0.5 }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {children}
  </Stack>
);
