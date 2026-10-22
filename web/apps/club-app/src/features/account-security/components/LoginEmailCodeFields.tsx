import { KkButton } from '@furria/ui/KkButton';
import { KkFormSection } from '@furria/ui/KkFormSection';
import { KkNote } from '@furria/ui/KkNote';
import { KkTextField } from '@furria/ui/KkTextField';
import type { FC } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { secondsUntil } from '@/lib/countdown';
import { useNow } from '@/lib/use-now';
import { toCodeSentLine, toCodeValidityLine } from '../account-security-labels';
import type { LoginEmailCodeForm } from '../schemas';

const CODE_SECTION = 'Bestätigungscode';
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
  const sentLine = toCodeSentLine(loginEmail);
  const resentLine = hasResentCode ? <KkNote tone="info">{RESENT_LINE}</KkNote> : null;

  return (
    <>
      <KkNote>{sentLine}</KkNote>
      {resentLine}
      <KkFormSection title={CODE_SECTION}>
        <KkTextField
          name={code.name}
          label={CODE_LABEL}
          inputMode="numeric"
          autoComplete="one-time-code"
          required
          autoFocus
          hint={validityLine}
          error={codeError !== undefined}
          helperText={codeError}
          onChange={code.onChange}
          onBlur={code.onBlur}
          inputRef={code.ref}
        />
        <KkButton variant="text" fullWidth disabled={isBusy} onClick={onEditAddress}>
          {EDIT_ADDRESS_LABEL}
        </KkButton>
      </KkFormSection>
    </>
  );
};
