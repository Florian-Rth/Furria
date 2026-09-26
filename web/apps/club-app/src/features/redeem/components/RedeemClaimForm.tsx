import { KkAlert, KkButton, KkHeading, KkIconButton, KkNote, KkTextField } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { ChangeEvent, FC } from 'react';
import { usePasswordVisibility } from '@/features/login';
import { useClaimForm } from '../hooks/use-claim-form';
import { toGreeting } from '../redeem-messages';
import type { LiveInvitation } from '../redeem-stage';
import { RedeemClaimPasskey } from './RedeemClaimPasskey';

const CLAIM_LINE =
  'Mit dieser Adresse gibt es schon einen Zugang. Melde dich damit an, dann wird er übernommen.';
const LOGIN_EMAIL_LABEL = 'Anmelde-E-Mail';
const PASSWORD_LABEL = 'Passwort dieses Zugangs';
const CLAIM_LABEL = 'Anmelden';
const CHANGE_EMAIL_LABEL = 'Andere E-Mail-Adresse';

interface RedeemClaimFormProps {
  invitation: LiveInvitation;
  loginEmail: string;
  isRedeeming: boolean;
  claimPasswordError: string | null;
  claimPasskeyError: string | null;
  offersPasskey: boolean;
  footerError: string | null;
  onClaim: (invitation: LiveInvitation, loginEmail: string, claimPassword: string) => void;
  onClaimWithPasskey: (invitation: LiveInvitation, loginEmail: string) => void;
  onChangeLoginEmail: () => void;
  onEdit: () => void;
}

export const RedeemClaimForm: FC<RedeemClaimFormProps> = ({
  invitation,
  loginEmail,
  isRedeeming,
  claimPasswordError,
  claimPasskeyError,
  offersPasskey,
  footerError,
  onClaim,
  onClaimWithPasskey,
  onChangeLoginEmail,
  onEdit,
}) => {
  const claimAccount = (claimPassword: string): void => {
    onClaim(invitation, loginEmail, claimPassword);
  };
  const claimAccountWithPasskey = (): void => {
    onClaimWithPasskey(invitation, loginEmail);
  };
  const { form, submit } = useClaimForm({ onClaim: claimAccount });
  const password = usePasswordVisibility();

  const passwordField = form.register('claimPassword');
  const passwordErrorText = form.formState.errors.claimPassword?.message ?? claimPasswordError;
  const passwordHelperText = passwordErrorText ?? undefined;
  const hasPasswordError = passwordHelperText !== undefined;
  const greeting = toGreeting(invitation.firstName);

  const editPassword = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    onEdit();
    void passwordField.onChange(event);
  };

  const submitAlert = footerError === null ? null : <KkAlert>{footerError}</KkAlert>;
  const passkeyClaim = offersPasskey ? (
    <RedeemClaimPasskey
      isRedeeming={isRedeeming}
      error={claimPasskeyError}
      onConfirm={claimAccountWithPasskey}
    />
  ) : null;
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
        <KkNote>{CLAIM_LINE}</KkNote>
      </Stack>
      <Stack component="form" noValidate onSubmit={submit} sx={{ gap: 2.5 }}>
        <KkTextField
          name="loginEmail"
          label={LOGIN_EMAIL_LABEL}
          type="email"
          autoComplete="username"
          value={loginEmail}
          readOnly
        />
        <KkTextField
          name={passwordField.name}
          label={PASSWORD_LABEL}
          type={password.fieldType}
          autoComplete="current-password"
          autoFocus
          required
          error={hasPasswordError}
          helperText={passwordHelperText}
          endAdornment={passwordToggle}
          onChange={editPassword}
          onBlur={passwordField.onBlur}
          inputRef={passwordField.ref}
        />
        {submitAlert}
        <KkButton type="submit" fullWidth loading={isRedeeming}>
          {CLAIM_LABEL}
        </KkButton>
      </Stack>
      {passkeyClaim}
      <KkButton variant="text" fullWidth disabled={isRedeeming} onClick={onChangeLoginEmail}>
        {CHANGE_EMAIL_LABEL}
      </KkButton>
    </Stack>
  );
};
