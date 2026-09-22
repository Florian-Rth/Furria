import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { toLandingKey } from '@/features/write';
import type { PersonRef } from '@/lib/api/schemas';
import { toIsoDay } from '@/lib/day';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useHandOutKeyMutation, useTakeBackKeyMutation } from '../api';
import { toHandoutConsequence, toPersonName, toReturnConsequence } from '../manage-keys-labels';
import type { KeyHolding } from '../schemas';

const HANDOUT_LABEL = 'Schlüssel ausgeben';
const RETURN_LABEL = 'Schlüssel zurücknehmen';
const KEYS_ROUTE = '/manage/keys';

interface KeyHoldingEditorInput {
  venueId: number;
  venueName: string;
  holding: KeyHolding | null;
}

export interface KeyHoldingEditorControl {
  isEditing: boolean;
  person: PersonRef | null;
  select: (person: PersonRef) => void;
  clearPerson: () => void;
  sinceOn: string | null;
  setSinceOn: (value: string | null) => void;
  untilOn: string | null;
  setUntilOn: (value: string | null) => void;
  consequence: string | null;
  rejection: string | null;
  isSaving: boolean;
  isDirty: boolean;
  actionLabel: string;
  submit: () => void;
}

export const useKeyHoldingEditor = ({
  venueId,
  venueName,
  holding,
}: KeyHoldingEditorInput): KeyHoldingEditorControl => {
  const today = toIsoDay(new Date());
  const isEditing = holding !== null;
  const initialUntilOn = holding?.untilOn ?? today;

  const [person, setPerson] = useState<PersonRef | null>(null);
  const [sinceOn, setSinceOn] = useState<string | null>(today);
  const [untilOn, setUntilOn] = useState<string | null>(initialUntilOn);
  const [rejection, setRejection] = useState<string | null>(null);

  const handoutMutation = useHandOutKeyMutation();
  const returnMutation = useTakeBackKeyMutation();
  const navigate = useNavigate();

  const personName = person === null ? '' : toPersonName(person);

  const landBack = (keyHoldingId: number): void => {
    void navigate({
      to: KEYS_ROUTE,
      search: (previous) => ({ ...previous, changed: toLandingKey('keyHolding', keyHoldingId) }),
      replace: true,
    });
  };

  const clearPerson = (): void => {
    setPerson(null);
    setRejection(null);
  };

  const select = (next: PersonRef): void => {
    setPerson(next);
    setRejection(null);
  };

  const submitHandout = (): void => {
    if (person === null || sinceOn === null) {
      return;
    }

    setRejection(null);
    handoutMutation.mutate(
      { venueId, venueName, personId: person.personId, personName, sinceOn },
      {
        onSuccess: (created) => {
          landBack(created.keyHoldingId);
        },
        onError: (error) => {
          setRejection(toWriteErrorMessage(error));
        },
      },
    );
  };

  const submitReturn = (): void => {
    if (holding === null || untilOn === null) {
      return;
    }

    setRejection(null);
    returnMutation.mutate(
      { keyHoldingId: holding.keyHoldingId, personName: toPersonName(holding), untilOn },
      {
        onSuccess: () => {
          landBack(holding.keyHoldingId);
        },
        onError: (error) => {
          setRejection(toWriteErrorMessage(error));
        },
      },
    );
  };

  const consequence =
    holding !== null
      ? untilOn === null
        ? null
        : toReturnConsequence(holding.firstName, venueName, untilOn, today)
      : person === null || sinceOn === null
        ? null
        : toHandoutConsequence(personName, venueName, sinceOn, today);

  return {
    isEditing,
    person,
    select,
    clearPerson,
    sinceOn,
    setSinceOn,
    untilOn,
    setUntilOn,
    consequence,
    rejection,
    isSaving: isEditing ? returnMutation.isPending : handoutMutation.isPending,
    isDirty: isEditing ? untilOn !== initialUntilOn : person !== null,
    actionLabel: isEditing ? RETURN_LABEL : HANDOUT_LABEL,
    submit: isEditing ? submitReturn : submitHandout,
  };
};
