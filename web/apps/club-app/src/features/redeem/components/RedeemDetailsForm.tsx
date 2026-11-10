import { KkAlert } from '@furria/ui/KkAlert';
import { KkButton } from '@furria/ui/KkButton';
import { KkCheckboxRow } from '@furria/ui/KkCheckboxRow';
import { KkHeading } from '@furria/ui/KkHeading';
import { KkIconButton } from '@furria/ui/KkIconButton';
import { KkNote } from '@furria/ui/KkNote';
import { KkTextField } from '@furria/ui/KkTextField';
import Stack from '@mui/material/Stack';
import type { ChangeEvent, FC } from 'react';
import { usePasswordVisibility } from '@/features/login/hooks/use-password-visibility';
import { useRedeemForm } from '../hooks/use-redeem-form';
import { toRedeemHeading } from '../redeem-messages';
import type { LiveInvitation } from '../redeem-stage';
import type { RedeemForm } from '../schemas';

const TAKEN_CONTACT_LINE =
  'Deine Kontakt-E-Mail nutzt schon jemand anderes zum Anmelden. Gib eine eigene Adresse an.';
const LOGIN_EMAIL_LABEL = 'Deine Anmelde-E-Mail';
const PASSWORD_LABEL = 'Neues Passwort';
const REDEEM_LABEL = 'Passwort festlegen';
const REQUEST_CODE_LABEL = 'Code senden';
const CONTACT_EMAIL_LABEL = 'Kontakt-E-Mail ebenfalls ändern';

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
  const { form, contactEmailFollows, needsConfirmation, submit } = useRedeemForm({
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
  const loginEmailHelperText = loginEmailErrorText ?? undefined;
  const submitLabel = needsConfirmation ? REQUEST_CODE_LABEL : REDEEM_LABEL;
  const greeting = toRedeemHeading(invitation.purpose, invitation.firstName);
  const startsOnEmail = invitation.suggestedLoginEmail === null;
  const offersContactEmailFollow = invitation.purpose === 'recovery' && needsConfirmation;

  const editLoginEmail = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    onEdit();
    void loginEmailField.onChange(event);
  };

  const takenLine = invitation.contactEmailTaken ? (
    <KkNote tone="hint" icon="info">
      {TAKEN_CONTACT_LINE}
    </KkNote>
  ) : null;
  const toggleContactEmail = (checked: boolean): void => {
    contactEmailFollows.field.onChange(checked);
  };

  const contactEmailFollow = offersContactEmailFollow ? (
    <KkCheckboxRow
      label={CONTACT_EMAIL_LABEL}
      checked={contactEmailFollows.field.value}
      onChange={toggleContactEmail}
    />
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
      <KkHeading level={1} component="h1">
        {greeting}
      </KkHeading>
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
          helperText={loginEmailHelperText}
          onChange={editLoginEmail}
          onBlur={loginEmailField.onBlur}
          inputRef={loginEmailField.ref}
        />
        {contactEmailFollow}
        <KkTextField
          name={passwordField.name}
          label={PASSWORD_LABEL}
          type={password.fieldType}
          autoComplete="new-password"
          autoFocus={!startsOnEmail}
          required
          error={hasPasswordError}
          helperText={passwordErrorText}
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
