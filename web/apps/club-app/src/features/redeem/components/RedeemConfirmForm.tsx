import { KkAlert, KkButton, KkHeading, KkNote, KkTextField } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { ChangeEvent, FC } from 'react';
import { formatCountdown, secondsUntil } from '@/lib/countdown';
import { useNow } from '@/lib/use-now';
import { useConfirmationForm } from '../hooks/use-confirmation-form';
import { toCodeValidityLine, toConfirmationSentLine } from '../redeem-messages';
import type { LiveInvitation } from '../redeem-stage';

const CONFIRM_TITLE = 'E-MAIL BESTÄTIGEN';
const CODE_LABEL = 'Code aus der Mail';
const CODE_EXPIRED_LINE = 'Der Code ist abgelaufen. Lass dir einen neuen schicken.';
const RESENT_LINE = 'Ein neuer Code ist unterwegs. Der vorige gilt nicht mehr.';
const CONFIRM_LABEL = 'Bestätigen';
const RESEND_LABEL = 'Neuen Code senden';
const CHANGE_EMAIL_LABEL = 'Andere E-Mail-Adresse';
const TICK_MS = 1000;

interface RedeemConfirmFormProps {
  invitation: LiveInvitation;
  loginEmail: string;
  expiresAt: string;
  hasResentCode: boolean;
  isRedeeming: boolean;
  codeError: string | null;
  footerError: string | null;
  onConfirm: (invitation: LiveInvitation, code: string) => void;
  onResend: (invitation: LiveInvitation) => void;
  onChangeLoginEmail: () => void;
  onEdit: () => void;
}

export const RedeemConfirmForm: FC<RedeemConfirmFormProps> = ({
  invitation,
  loginEmail,
  expiresAt,
  hasResentCode,
  isRedeeming,
  codeError,
  footerError,
  onConfirm,
  onResend,
  onChangeLoginEmail,
  onEdit,
}) => {
  const confirmCode = (code: string): void => {
    onConfirm(invitation, code);
  };
  const { form, submit } = useConfirmationForm({ onConfirm: confirmCode });
  const now = useNow(TICK_MS);
  const secondsLeft = secondsUntil(expiresAt, now);

  const codeField = form.register('code');
  const codeErrorText = form.formState.errors.code?.message ?? codeError;
  const hasCodeError = codeErrorText !== null && codeErrorText !== undefined;
  const validityLine =
    secondsLeft > 0 ? toCodeValidityLine(formatCountdown(secondsLeft)) : CODE_EXPIRED_LINE;

  const editCode = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    onEdit();
    void codeField.onChange(event);
  };
  const resend = (): void => {
    onResend(invitation);
  };

  const resentLine = hasResentCode ? <KkNote tone="info">{RESENT_LINE}</KkNote> : null;
  const submitAlert = footerError === null ? null : <KkAlert>{footerError}</KkAlert>;

  return (
    <Stack sx={{ gap: 2.5, minWidth: 0 }}>
      <Stack sx={{ gap: 1 }}>
        <KkHeading level={1} component="h1">
          {CONFIRM_TITLE}
        </KkHeading>
        <KkNote>{toConfirmationSentLine(loginEmail)}</KkNote>
      </Stack>
      {resentLine}
      <Stack component="form" noValidate onSubmit={submit} sx={{ gap: 2.5 }}>
        <KkTextField
          name={codeField.name}
          label={CODE_LABEL}
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          required
          error={hasCodeError}
          helperText={codeErrorText ?? validityLine}
          onChange={editCode}
          onBlur={codeField.onBlur}
          inputRef={codeField.ref}
        />
        {submitAlert}
        <KkButton type="submit" fullWidth loading={isRedeeming}>
          {CONFIRM_LABEL}
        </KkButton>
      </Stack>
      <Stack sx={{ gap: 1.25 }}>
        <KkButton variant="outlined" fullWidth disabled={isRedeeming} onClick={resend}>
          {RESEND_LABEL}
        </KkButton>
        <KkButton variant="text" fullWidth disabled={isRedeeming} onClick={onChangeLoginEmail}>
          {CHANGE_EMAIL_LABEL}
        </KkButton>
      </Stack>
    </Stack>
  );
};
