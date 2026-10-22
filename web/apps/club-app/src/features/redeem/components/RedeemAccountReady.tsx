import { KkButton } from '@furria/ui/KkButton';
import { KkHeading } from '@furria/ui/KkHeading';
import { KkNote } from '@furria/ui/KkNote';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { LOGIN_PATH } from '@/lib/return-to';
import { toRedeemFailureMessage } from '../redeem-messages';

const READY_TITLE = 'DEIN ZUGANG STEHT';
const READY_LINE = toRedeemFailureMessage('sessionLost');
const LOGIN_LABEL = 'Jetzt anmelden';

export const RedeemAccountReady: FC = () => (
  <Stack sx={{ gap: 2.5, minWidth: 0 }}>
    <Stack sx={{ gap: 1 }}>
      <KkHeading level={1} component="h1">
        {READY_TITLE}
      </KkHeading>
      <KkNote>{READY_LINE}</KkNote>
    </Stack>
    <KkButton fullWidth component={Link} to={LOGIN_PATH}>
      {LOGIN_LABEL}
    </KkButton>
  </Stack>
);
