import { KkButton, KkHeading, KkNote } from '@furria/ui';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { MailRequestForm, MailRequestSent, SignedOutFrame } from '@/features/login';
import { LOGIN_PATH } from '@/lib/return-to';
import { useRequestAccess } from '../hooks/use-request-access';

const TITLE = 'ZUGANG ANFORDERN';
const INTRO =
  'Gib die E-Mail-Adresse an, die der Verein von dir hat. Dorthin schicken wir dir einen Link, mit dem du dein Passwort festlegst.';
const EMAIL_HINT = 'Die Adresse aus deinen Kontaktdaten beim Verein.';
const SUBMIT_LABEL = 'Einladung anfordern';
const SENT_HINT =
  'Kommt nichts an? Dann hat der Verein eine andere Adresse von dir, oder du hast schon einen Zugang. Wende dich in dem Fall an den Verein.';
const LOGIN_LABEL = 'Zur Anmeldung';

export const RequestAccessScreen: FC = () => {
  const control = useRequestAccess();

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
