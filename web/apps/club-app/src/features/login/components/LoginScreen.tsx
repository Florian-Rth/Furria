import { KkAlert, KkHeading, KkNote } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { SessionFarewell } from '@/lib/api/session/session-store';
import {
  FAREWELL_MESSAGES,
  PASSWORD_RESET_NOTICE,
  SESSION_EXPIRED_MESSAGE,
} from '../login-messages';
import { LoginForm } from './LoginForm';
import { LoginTestCredentials } from './LoginTestCredentials';
import { LoginWaysOn } from './LoginWaysOn';
import { PasskeySignIn } from './PasskeySignIn';
import { SignedOutFrame } from './SignedOutFrame';

const INTRO = 'Der Mitgliederbereich des FCC.';

interface LoginScreenProps {
  expired: boolean;
  farewell: SessionFarewell | null;
  passwordReset: boolean;
}

export const LoginScreen: FC<LoginScreenProps> = ({ expired, farewell, passwordReset }) => {
  const expiredNotice = expired ? (
    <KkAlert severity="warning">{SESSION_EXPIRED_MESSAGE}</KkAlert>
  ) : null;
  const farewellNotice =
    farewell === null ? null : <KkAlert severity="info">{FAREWELL_MESSAGES[farewell]}</KkAlert>;
  const passwordResetNotice = passwordReset ? (
    <KkAlert severity="success">{PASSWORD_RESET_NOTICE}</KkAlert>
  ) : null;

  return (
    <SignedOutFrame>
      <Stack sx={{ gap: 1 }}>
        <KkHeading level={1} component="h1">
          ANMELDEN
        </KkHeading>
        <KkNote>{INTRO}</KkNote>
      </Stack>
      {expiredNotice}
      {farewellNotice}
      {passwordResetNotice}
      <LoginForm />
      <PasskeySignIn />
      <LoginWaysOn />
      <LoginTestCredentials />
    </SignedOutFrame>
  );
};
