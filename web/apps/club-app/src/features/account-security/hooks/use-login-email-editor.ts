import { useKkNotice } from '@furria/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import type { UseControllerReturn, UseFormReturn } from 'react-hook-form';
import { useController, useForm } from 'react-hook-form';
import { toLandingKey } from '@/features/write';
import { useGoBackTo } from '@/lib/use-go-back-to';
import {
  SECURITY_LANDINGS,
  SECURITY_PATH,
  toLoginEmailSavedMessage,
} from '../account-security-labels';
import { useLoginEmailChangeMutation, useLoginEmailConfirmationMutation } from '../api';
import { refusesField, toFieldRefusals } from '../field-refusals';
import type { LoginEmailStep, PendingLoginEmail } from '../login-email-step';
import { isCurrentLoginEmail, toLoginEmailStep } from '../login-email-step';
import type { LoginEmailCodeForm, LoginEmailForm } from '../schemas';
import {
  LOGIN_EMAIL_CODE_FIELD_NAMES,
  LOGIN_EMAIL_FIELD_NAMES,
  LoginEmailCodeFormSchema,
  LoginEmailFormSchema,
  toConfirmationDigits,
} from '../schemas';

const SAME_LOGIN_EMAIL_MESSAGE = 'Mit dieser Adresse meldest du dich schon an.';

export interface LoginEmailEditorControl {
  step: LoginEmailStep;
  addressForm: UseFormReturn<LoginEmailForm>;
  codeForm: UseFormReturn<LoginEmailCodeForm>;
  contactEmailFollows: UseControllerReturn<LoginEmailForm, 'updateContactEmail'>;
  isDirty: boolean;
  canSubmit: boolean;
  isSending: boolean;
  isConfirming: boolean;
  hasResentCode: boolean;
  rejection: string | null;
  submit: () => void;
  resend: () => void;
  editAddress: () => void;
}

export const useLoginEmailEditor = (currentLoginEmail: string): LoginEmailEditorControl => {
  const [pending, setPending] = useState<PendingLoginEmail | null>(null);
  const [loginEmailRefused, setLoginEmailRefused] = useState(false);
  const [hasResentCode, setHasResentCode] = useState(false);
  const [rejection, setRejection] = useState<string | null>(null);
  const change = useLoginEmailChangeMutation();
  const confirmation = useLoginEmailConfirmationMutation();
  const goBackTo = useGoBackTo();
  const raiseNotice = useKkNotice();

  const addressForm = useForm<LoginEmailForm>({
    resolver: zodResolver(LoginEmailFormSchema),
    defaultValues: { loginEmail: '', updateContactEmail: true },
    mode: 'onTouched',
  });
  const codeForm = useForm<LoginEmailCodeForm>({
    resolver: zodResolver(LoginEmailCodeFormSchema),
    defaultValues: { code: '' },
    mode: 'onTouched',
  });
  const contactEmailFollows = useController({
    control: addressForm.control,
    name: 'updateContactEmail',
  });
  const step = toLoginEmailStep(pending, loginEmailRefused);

  const showAddressFailure = (error: Error): void => {
    const failures = toFieldRefusals(error, LOGIN_EMAIL_FIELD_NAMES);

    for (const failure of failures.fields) {
      addressForm.setError(failure.name, { message: failure.message });
    }

    setRejection(failures.footer);
  };

  const showCodeFailure = (error: Error): void => {
    const failures = toFieldRefusals(error, LOGIN_EMAIL_CODE_FIELD_NAMES);

    for (const failure of failures.fields) {
      if (failure.name === 'code') {
        codeForm.setError('code', { message: failure.message });
      } else {
        addressForm.setError('loginEmail', { message: failure.message });
      }
    }

    setLoginEmailRefused(refusesField(failures, 'loginEmail'));
    setRejection(failures.footer);
  };

  const sendCode = (values: LoginEmailForm, resent: boolean): void => {
    change.mutate(values, {
      onSuccess: (sent) => {
        setPending({ ...values, expiresAt: sent.confirmationExpiresAt });
        setLoginEmailRefused(false);
        setHasResentCode(resent);
        codeForm.reset();
      },
      onError: showAddressFailure,
    });
  };

  const landOnSecurity = (confirmed: PendingLoginEmail): void => {
    raiseNotice({
      tone: 'success',
      message: toLoginEmailSavedMessage(confirmed.loginEmail, confirmed.updateContactEmail),
    });
    void goBackTo({
      to: SECURITY_PATH,
      search: (previous) => ({
        ...previous,
        changed: toLandingKey(SECURITY_LANDINGS.loginEmail.kind, SECURITY_LANDINGS.loginEmail.id),
      }),
      ignoreBlocker: true,
    });
  };

  const closeUnchanged = (): void => {
    void goBackTo({ to: SECURITY_PATH });
  };

  const submitAddress = addressForm.handleSubmit((values) => {
    setRejection(null);

    if (!addressForm.formState.isDirty) {
      closeUnchanged();
      return;
    }
    if (isCurrentLoginEmail(values.loginEmail, currentLoginEmail)) {
      addressForm.setError('loginEmail', { message: SAME_LOGIN_EMAIL_MESSAGE });
      return;
    }

    sendCode(values, false);
  });

  const submitCode = codeForm.handleSubmit((values) => {
    setRejection(null);

    if (pending === null) {
      return;
    }

    confirmation.mutate(toConfirmationDigits(values.code), {
      onSuccess: () => {
        landOnSecurity(pending);
      },
      onError: showCodeFailure,
    });
  });

  const resend = (): void => {
    setRejection(null);

    if (pending !== null) {
      sendCode(
        { loginEmail: pending.loginEmail, updateContactEmail: pending.updateContactEmail },
        true,
      );
    }
  };

  const editAddress = (): void => {
    setRejection(null);
    setPending(null);
    setHasResentCode(false);
  };

  const isAddressStep = step.kind === 'address';

  return {
    step,
    addressForm,
    codeForm,
    contactEmailFollows,
    isDirty: addressForm.formState.isDirty || pending !== null,
    canSubmit: isAddressStep ? addressForm.formState.isValid : codeForm.formState.isValid,
    isSending: change.isPending,
    isConfirming: confirmation.isPending,
    hasResentCode,
    rejection,
    submit: () => {
      void (isAddressStep ? submitAddress() : submitCode());
    },
    resend,
    editAddress,
  };
};
