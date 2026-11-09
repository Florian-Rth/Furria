import { KkButton } from '@furria/ui/KkButton';
import { KkHeading } from '@furria/ui/KkHeading';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { MailRequestForm } from '@/features/login/components/MailRequestForm';
import { MailRequestSent } from '@/features/login/components/MailRequestSent';
import { SignedOutFrame } from '@/features/login/components/SignedOutFrame';
import { LOGIN_PATH } from '@/lib/return-to';
import { useForgotPassword } from '../hooks/use-forgot-password';

const TITLE = 'PASSWORT VERGESSEN';
const EMAIL_HINT = 'Deine Anmelde-E-Mail.';
const SUBMIT_LABEL = 'Link anfordern';
const LOGIN_LABEL = 'Zur Anmeldung';

export const ForgotPasswordScreen: FC = () => {
  const control = useForgotPassword();

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
