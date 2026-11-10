import { KkButton } from '@furria/ui/KkButton';
import { KkHeading } from '@furria/ui/KkHeading';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { MailRequestForm } from '@/features/login/components/MailRequestForm';
import { MailRequestSent } from '@/features/login/components/MailRequestSent';
import { SignedOutFrame } from '@/features/login/components/SignedOutFrame';
import { LOGIN_PATH } from '@/lib/return-to';
import { useRequestAccess } from '../hooks/use-request-access';

const TITLE = 'ZUGANG ANFORDERN';
const EMAIL_HINT = 'Die Adresse aus deinen Kontaktdaten beim Verein.';
const SUBMIT_LABEL = 'Einladung anfordern';
const LOGIN_LABEL = 'Zur Anmeldung';

export const RequestAccessScreen: FC = () => {
  const control = useRequestAccess();

  if (control.isSent) {
    return (
      <SignedOutFrame>
        <MailRequestSent />
      </SignedOutFrame>
    );
  }

  return (
    <SignedOutFrame>
      <Stack sx={{ gap: 2.5, minWidth: 0 }}>
        <KkHeading level={1} component="h1">
          {TITLE}
        </KkHeading>
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
