import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkPollBallotRootProps extends PropsWithChildren {
  label: string;
  sx?: KkSx;
}

export const KkPollBallotRoot: FC<KkPollBallotRootProps> = ({ label, sx, children }) => (
  <Stack
    component="section"
    aria-label={label}
    data-kk-poll-ballot
    sx={[{ gap: 1, minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {children}
  </Stack>
);
