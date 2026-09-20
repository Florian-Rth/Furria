import { useState } from 'react';
import { toIsoDay } from '@/lib/day';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useTakeBackKeyMutation } from '../api';
import { toPersonName, toReturnConsequence } from '../manage-keys-labels';
import type { KeyHolding } from '../schemas';

interface KeyReturnFormInput {
  holding: KeyHolding | null;
  venueName: string;
  onTakenBack: () => void;
}

export interface KeyReturnFormControl {
  holding: KeyHolding | null;
  untilOn: string | null;
  setUntilOn: (value: string | null) => void;
  consequence: string | null;
  rejection: string | null;
  isSaving: boolean;
  submit: () => void;
}

export const useKeyReturnForm = ({
  holding,
  venueName,
  onTakenBack,
}: KeyReturnFormInput): KeyReturnFormControl => {
  const today = toIsoDay(new Date());
  const [shown, setShown] = useState<KeyHolding | null>(holding);
  const [untilOn, setUntilOn] = useState<string | null>(today);
  const [rejection, setRejection] = useState<string | null>(null);
  const mutation = useTakeBackKeyMutation();

  if (holding !== null && holding.keyHoldingId !== shown?.keyHoldingId) {
    setShown(holding);
    setUntilOn(today);
    setRejection(null);
  }

  const submit = (): void => {
    if (shown === null || untilOn === null) {
      return;
    }

    setRejection(null);
    mutation.mutate(
      { keyHoldingId: shown.keyHoldingId, personName: toPersonName(shown), untilOn },
      {
        onSuccess: onTakenBack,
        onError: (error) => {
          setRejection(toWriteErrorMessage(error));
        },
      },
    );
  };

  return {
    holding: shown,
    untilOn,
    setUntilOn,
    consequence:
      shown === null || untilOn === null
        ? null
        : toReturnConsequence(shown.firstName, venueName, untilOn, today),
    rejection,
    isSaving: mutation.isPending,
    submit,
  };
};
