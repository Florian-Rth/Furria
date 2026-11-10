import { KkButton } from '@furria/ui/KkButton';
import { KkHeading } from '@furria/ui/KkHeading';
import { KkNote } from '@furria/ui/KkNote';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { LOGIN_PATH } from '@/lib/return-to';
import { CLOSED_LINE, CLOSED_TITLE, LOGIN_LABEL, REQUEST_ACCESS_LABEL } from '../claim-window-copy';

const REQUEST_ACCESS_PATH = '/request-access';

export const ClaimWindowClosed: FC = () => (
  <Stack sx={{ gap: 2.5, minWidth: 0 }}>
    <Stack sx={{ gap: 1 }}>
      <KkHeading level={1} component="h1">
        {CLOSED_TITLE}
      </KkHeading>
      <KkNote>{CLOSED_LINE}</KkNote>
    </Stack>
    <KkButton variant="outlined" fullWidth component={Link} to={REQUEST_ACCESS_PATH}>
      {REQUEST_ACCESS_LABEL}
    </KkButton>
    <KkButton variant="text" fullWidth component={Link} to={LOGIN_PATH}>
      {LOGIN_LABEL}
    </KkButton>
  </Stack>
);
