import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkPollBallotChoicesProps extends PropsWithChildren {
  label: string;
  busy?: boolean;
  sx?: KkSx;
}

export const KkPollBallotChoices: FC<KkPollBallotChoicesProps> = ({
  label,
  busy = false,
  sx,
  children,
}) => (
  <Stack
    role="group"
    aria-label={label}
    aria-busy={busy}
    data-kk-poll-ballot-choices
    sx={[{ gap: 0.5, minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {children}
  </Stack>
);
