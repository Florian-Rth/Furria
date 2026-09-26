import { KkAlert, KkButton, KkHeading, KkIconButton, KkNote, KkTextField } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { ChangeEvent, FC } from 'react';
import { usePasswordVisibility } from '@/features/login';
import { useRedeemForm } from '../hooks/use-redeem-form';
import { toRedeemHeading } from '../redeem-messages';
import type { InvitationPurpose, LiveInvitation } from '../redeem-stage';
import type { RedeemForm } from '../schemas';
import { PASSWORD_MIN_LENGTH } from '../schemas';

const INTROS: Record<InvitationPurpose, string> = {
  onboarding: 'Du bist eingeladen. Leg ein Passwort fest, dann bist du im Mitgliederbereich.',
  recovery:
    'Der Verein hat deinen Zugang wiederhergestellt. Leg ein neues Passwort fest – auf allen anderen Geräten wirst du dann abgemeldet.',
};
const TAKEN_CONTACT_LINE =
  'Die E-Mail-Adresse, die der Verein von dir hat, nutzt schon jemand anderes zum Anmelden. Gib deine eigene an – wir schicken dir einen Code, um sie zu bestätigen.';
const LOGIN_EMAIL_LABEL = 'Deine Anmelde-E-Mail';
const LOGIN_EMAIL_HINT = 'Damit meldest du dich künftig an.';
const CONFIRMATION_HINT = 'An diese Adresse schicken wir dir einen Code zur Bestätigung.';
const PASSWORD_LABEL = 'Neues Passwort';
const PASSWORD_HINT = `Mindestens ${PASSWORD_MIN_LENGTH} Zeichen.`;
const REDEEM_LABEL = 'Passwort festlegen';
const REQUEST_CODE_LABEL = 'Code senden';

interface RedeemDetailsFormProps {
  invitation: LiveInvitation;
  defaultLoginEmail: string;
  isRedeeming: boolean;
  loginEmailError: string | null;
  footerError: string | null;
  onRedeem: (invitation: LiveInvitation, values: RedeemForm) => void;
  onEdit: () => void;
}

export const RedeemDetailsForm: FC<RedeemDetailsFormProps> = ({
  invitation,
  defaultLoginEmail,
  isRedeeming,
  loginEmailError,
  footerError,
  onRedeem,
  onEdit,
}) => {
  const redeemInvitation = (values: RedeemForm): void => {
    onRedeem(invitation, values);
  };
  const { form, needsConfirmation, submit } = useRedeemForm({
    defaultLoginEmail,
    suggestedLoginEmail: invitation.suggestedLoginEmail,
    onRedeem: redeemInvitation,
  });
  const password = usePasswordVisibility();

  const loginEmailField = form.register('loginEmail');
  const passwordField = form.register('password');
  const loginEmailErrorText = form.formState.errors.loginEmail?.message ?? loginEmailError;
  const passwordErrorText = form.formState.errors.password?.message;
  const hasLoginEmailError = loginEmailErrorText !== null && loginEmailErrorText !== undefined;
  const hasPasswordError = passwordErrorText !== undefined;
  const loginEmailHint = needsConfirmation ? CONFIRMATION_HINT : LOGIN_EMAIL_HINT;
  const submitLabel = needsConfirmation ? REQUEST_CODE_LABEL : REDEEM_LABEL;
  const greeting = toRedeemHeading(invitation.purpose, invitation.firstName);
  const intro = INTROS[invitation.purpose];
  const startsOnEmail = invitation.suggestedLoginEmail === null;

  const editLoginEmail = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    onEdit();
    void loginEmailField.onChange(event);
  };

  const takenLine = invitation.contactEmailTaken ? (
    <KkNote tone="hint" icon="info">
      {TAKEN_CONTACT_LINE}
    </KkNote>
  ) : null;
  const submitAlert = footerError === null ? null : <KkAlert>{footerError}</KkAlert>;
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
        <KkNote>{intro}</KkNote>
      </Stack>
      {takenLine}
      <Stack component="form" noValidate onSubmit={submit} sx={{ gap: 2.5 }}>
        <KkTextField
          name={loginEmailField.name}
          label={LOGIN_EMAIL_LABEL}
          type="email"
          inputMode="email"
          autoComplete="username"
          autoFocus={startsOnEmail}
          required
          error={hasLoginEmailError}
          helperText={loginEmailErrorText ?? loginEmailHint}
          onChange={editLoginEmail}
          onBlur={loginEmailField.onBlur}
          inputRef={loginEmailField.ref}
        />
        <KkTextField
          name={passwordField.name}
          label={PASSWORD_LABEL}
          type={password.fieldType}
          autoComplete="new-password"
          autoFocus={!startsOnEmail}
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
          {submitLabel}
        </KkButton>
      </Stack>
    </Stack>
  );
};
