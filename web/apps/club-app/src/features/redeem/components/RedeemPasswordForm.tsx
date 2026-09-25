import { KkAlert, KkButton, KkHeading, KkIconButton, KkNote, KkTextField } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { usePasswordVisibility } from '@/features/login';
import { useRedeemForm } from '../hooks/use-redeem-form';
import { toGreeting } from '../redeem-messages';
import { PASSWORD_MIN_LENGTH } from '../schemas';

const INTRO = 'Du bist eingeladen. Leg ein Passwort fest, dann bist du im Mitgliederbereich.';
const LOGIN_EMAIL_LABEL = 'Deine Anmelde-E-Mail';
const LOGIN_EMAIL_HINT = 'Damit meldest du dich künftig an.';
const PASSWORD_LABEL = 'Neues Passwort';
const PASSWORD_HINT = `Mindestens ${PASSWORD_MIN_LENGTH} Zeichen.`;
const SUBMIT_LABEL = 'Passwort festlegen';

interface LiveInvitation {
  token: string;
  firstName: string;
  loginEmail: string;
}

interface RedeemPasswordFormProps {
  invitation: LiveInvitation;
  isRedeeming: boolean;
  redeemError: string | null;
  onRedeem: (token: string, password: string) => void;
}

export const RedeemPasswordForm: FC<RedeemPasswordFormProps> = ({
  invitation,
  isRedeeming,
  redeemError,
  onRedeem,
}) => {
  const redeemWithToken = (password: string): void => {
    onRedeem(invitation.token, password);
  };
  const { form, submit } = useRedeemForm({ onRedeem: redeemWithToken });
  const password = usePasswordVisibility();

  const passwordField = form.register('password');
  const passwordErrorText = form.formState.errors.password?.message;
  const hasPasswordError = passwordErrorText !== undefined;
  const greeting = toGreeting(invitation.firstName);

  const submitAlert = redeemError === null ? null : <KkAlert>{redeemError}</KkAlert>;
  const passwordToggle = (
    <KkIconButton
      label={password.toggleLabel}
      icon={password.toggleIcon}
      size="small"
      onClick={password.toggle}
    />
  );

  return (
    <Stack sx={{ gap: 2.5, minWidth: 0 }}>
      <Stack sx={{ gap: 1 }}>
        <KkHeading level={1} component="h1">
          {greeting}
        </KkHeading>
        <KkNote>{INTRO}</KkNote>
      </Stack>
      <Stack component="form" noValidate onSubmit={submit} sx={{ gap: 2.5 }}>
        <KkTextField
          name="username"
          label={LOGIN_EMAIL_LABEL}
          type="email"
          autoComplete="username"
          value={invitation.loginEmail}
          helperText={LOGIN_EMAIL_HINT}
          readOnly
        />
        <KkTextField
          name={passwordField.name}
          label={PASSWORD_LABEL}
          type={password.fieldType}
          autoComplete="new-password"
          autoFocus
          required
          error={hasPasswordError}
          helperText={passwordErrorText ?? PASSWORD_HINT}
          endAdornment={passwordToggle}
          onChange={passwordField.onChange}
          onBlur={passwordField.onBlur}
          inputRef={passwordField.ref}
        />
        {submitAlert}
        <KkButton type="submit" fullWidth loading={isRedeeming}>
          {SUBMIT_LABEL}
        </KkButton>
      </Stack>
    </Stack>
  );
};
