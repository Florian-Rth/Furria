import { useNavigate } from '@tanstack/react-router';
import type { ChangeEvent, FormEvent } from 'react';
import { useState } from 'react';
import { useCodeLookupMutation } from '../api';
import { isCompleteInvitationCode, normalizeInvitationCode } from '../invitation-code';
import { toCodeFragment } from '../invitation-credential';
import { INVITATION_PATH } from '../invitation-token';
import { toRedeemFailureKind } from '../redeem-failure';
import { toRedeemFailureMessage } from '../redeem-messages';

const DEAD_CODE_MESSAGE =
  'Dieser Code gilt nicht. Prüf ihn noch einmal oder lass dir vor Ort einen neuen zeigen.';

export interface CodeEntryControl {
  code: string;
  canSubmit: boolean;
  isLookingUp: boolean;
  refusal: string | null;
  change: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  submit: (event: FormEvent<HTMLFormElement>) => void;
}

export const useCodeEntry = (): CodeEntryControl => {
  const [code, setCode] = useState('');
  const lookup = useCodeLookupMutation();
  const navigate = useNavigate();
  const failure = toRedeemFailureKind(lookup.error);
  const isComplete = isCompleteInvitationCode(code);

  const change = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    setCode(normalizeInvitationCode(event.target.value));
    lookup.reset();
  };

  const submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!isComplete) {
      return;
    }

    lookup.mutate(
      { kind: 'code', code },
      {
        onSuccess: (found) => {
          if (found.status === 'live') {
            void navigate({ to: INVITATION_PATH, hash: toCodeFragment(code) });
          }
        },
      },
    );
  };

  const toRefusal = (): string | null => {
    if (lookup.data?.status === 'dead') {
      return DEAD_CODE_MESSAGE;
    }

    return failure === null ? null : toRedeemFailureMessage(failure);
  };

  return {
    code,
    canSubmit: isComplete,
    isLookingUp: lookup.isPending || lookup.data?.status === 'live',
    refusal: toRefusal(),
    change,
    submit,
  };
};
