import { KkButton, KkHeading, KkNote } from '@furria/ui';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { LOGIN_PATH } from '@/lib/return-to';

const SENT_TITLE = 'SCHAU IN DEIN POSTFACH';
const SENT_LINE = 'Wenn die Adresse bei uns hinterlegt ist, bekommst du gleich eine Mail.';
const LOGIN_LABEL = 'Zur Anmeldung';

interface MailRequestSentProps {
  hint: string;
}

export const MailRequestSent: FC<MailRequestSentProps> = ({ hint }) => (
  <Stack sx={{ gap: 2.5, minWidth: 0 }}>
    <Stack sx={{ gap: 1 }}>
      <KkHeading level={1} component="h1">
        {SENT_TITLE}
      </KkHeading>
      <KkNote>{SENT_LINE}</KkNote>
    </Stack>
    <KkNote tone="hint" icon="info">
      {hint}
    </KkNote>
    <KkButton variant="outlined" fullWidth component={Link} to={LOGIN_PATH}>
      {LOGIN_LABEL}
    </KkButton>
  </Stack>
);
