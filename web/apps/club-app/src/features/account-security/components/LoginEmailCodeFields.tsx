import { KkButton, KkNote, KkTextField } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { secondsUntil } from '@/lib/countdown';
import { useNow } from '@/lib/use-now';
import { toCodeSentLine, toCodeValidityLine } from '../account-security-labels';
import type { LoginEmailCodeForm } from '../schemas';

const CODE_LABEL = 'Code aus der Mail';
const RESENT_LINE = 'Ein neuer Code ist unterwegs. Der vorige gilt nicht mehr.';
const EDIT_ADDRESS_LABEL = 'Andere Adresse eingeben';
const TICK_MS = 1000;

interface LoginEmailCodeFieldsProps {
  form: UseFormReturn<LoginEmailCodeForm>;
  loginEmail: string;
  expiresAt: string;
  hasResentCode: boolean;
  isBusy: boolean;
  onEditAddress: () => void;
}

export const LoginEmailCodeFields: FC<LoginEmailCodeFieldsProps> = ({
  form,
  loginEmail,
  expiresAt,
  hasResentCode,
  isBusy,
  onEditAddress,
}) => {
  const now = useNow(TICK_MS);
  const code = form.register('code');
  const codeError = form.formState.errors.code?.message;
  const validityLine = toCodeValidityLine(secondsUntil(expiresAt, now));
  const resentLine = hasResentCode ? <KkNote tone="info">{RESENT_LINE}</KkNote> : null;

  return (
    <Stack sx={{ gap: 2.5, minWidth: 0 }}>
      <KkNote>{toCodeSentLine(loginEmail)}</KkNote>
      {resentLine}
      <KkTextField
        name={code.name}
        label={CODE_LABEL}
        inputMode="numeric"
        autoComplete="one-time-code"
        required
        autoFocus
        error={codeError !== undefined}
        helperText={codeError ?? validityLine}
        onChange={code.onChange}
        onBlur={code.onBlur}
        inputRef={code.ref}
      />
      <KkButton variant="text" fullWidth disabled={isBusy} onClick={onEditAddress}>
        {EDIT_ADDRESS_LABEL}
      </KkButton>
    </Stack>
  );
};
