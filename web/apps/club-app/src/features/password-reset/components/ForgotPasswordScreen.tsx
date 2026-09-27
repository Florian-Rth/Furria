import { KkButton, KkHeading, KkNote } from '@furria/ui';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { MailRequestForm, MailRequestSent, SignedOutFrame } from '@/features/login';
import { LOGIN_PATH } from '@/lib/return-to';
import { useForgotPassword } from '../hooks/use-forgot-password';

const TITLE = 'PASSWORT VERGESSEN';
const INTRO =
  'Gib die E-Mail-Adresse an, mit der du dich anmeldest. Dorthin schicken wir dir einen Link, mit dem du ein neues Passwort festlegst.';
const EMAIL_HINT = 'Deine Anmelde-E-Mail.';
const SUBMIT_LABEL = 'Link anfordern';
const SENT_HINT =
  'Der Link gilt eine Stunde. Kommt nichts an? Prüf, ob du dich mit dieser Adresse anmeldest, und schau auch im Spam-Ordner nach.';
const LOGIN_LABEL = 'Zur Anmeldung';

export const ForgotPasswordScreen: FC = () => {
  const control = useForgotPassword();

  if (control.isSent) {
    return (
      <SignedOutFrame>
        <MailRequestSent hint={SENT_HINT} />
      </SignedOutFrame>
    );
  }

  return (
    <SignedOutFrame>
      <Stack sx={{ gap: 2.5, minWidth: 0 }}>
        <Stack sx={{ gap: 1 }}>
          <KkHeading level={1} component="h1">
            {TITLE}
          </KkHeading>
          <KkNote>{INTRO}</KkNote>
        </Stack>
        <MailRequestForm
          hint={EMAIL_HINT}
          submitLabel={SUBMIT_LABEL}
          isRequesting={control.isRequesting}
          failure={control.failure}
          onRequest={control.request}
        />
        <KkButton variant="text" fullWidth component={Link} to={LOGIN_PATH}>
          {LOGIN_LABEL}
        </KkButton>
      </Stack>
    </SignedOutFrame>
  );
};
