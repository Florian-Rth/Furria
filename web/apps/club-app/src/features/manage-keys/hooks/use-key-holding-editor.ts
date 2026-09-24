import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useController, useForm } from 'react-hook-form';
import { toLandingKey } from '@/features/write';
import type { PersonRef } from '@/lib/api/schemas';
import { toIsoDay } from '@/lib/day';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useHandOutKeyMutation, useTakeBackKeyMutation } from '../api';
import { toHandoutConsequence, toPersonName, toReturnConsequence } from '../manage-keys-labels';
import type { KeyHolding } from '../schemas';
import { KeyHandoutFormSchema, KeyReturnFormSchema } from '../schemas';

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
  sinceOnError: string | undefined;
  untilOn: string | null;
  setUntilOn: (value: string | null) => void;
  untilOnError: string | undefined;
  consequence: string | null;
  rejection: string | null;
  isSaving: boolean;
  isDirty: boolean;
  canSubmit: boolean;
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
  const [rejection, setRejection] = useState<string | null>(null);

  const handoutMutation = useHandOutKeyMutation();
  const returnMutation = useTakeBackKeyMutation();
  const navigate = useNavigate();

  const handoutForm = useForm({
    resolver: zodResolver(KeyHandoutFormSchema),
    defaultValues: { person: null, sinceOn: today },
    mode: 'onTouched',
  });
  const returnForm = useForm({
    resolver: zodResolver(KeyReturnFormSchema),
    defaultValues: { untilOn: holding?.untilOn ?? today },
    mode: 'onTouched',
  });
  const handoutState = handoutForm.formState;
  const returnState = returnForm.formState;
  const { isDirty: isHandoutDirty, isValid: isHandoutValid } = handoutState;
  const { isDirty: isReturnDirty, isValid: isReturnValid } = returnState;
  const personField = useController({ control: handoutForm.control, name: 'person' });
  const sinceOnField = useController({ control: handoutForm.control, name: 'sinceOn' });
  const untilOnField = useController({ control: returnForm.control, name: 'untilOn' });

  const person = personField.field.value;
  const sinceOn = sinceOnField.field.value;
  const untilOn = untilOnField.field.value;
  const personName = person === null ? '' : toPersonName(person);

  const landBack = (keyHoldingId: number): void => {
    void navigate({
      to: KEYS_ROUTE,
      search: (previous) => ({ ...previous, changed: toLandingKey('keyHolding', keyHoldingId) }),
      replace: true,
    });
  };

  const fail = (error: Error): void => {
    setRejection(toWriteErrorMessage(error));
  };

  const clearPerson = (): void => {
    personField.field.onChange(null);
    setRejection(null);
  };

  const select = (next: PersonRef): void => {
    personField.field.onChange(next);
    setRejection(null);
  };

  const submitHandout = handoutForm.handleSubmit((values) => {
    setRejection(null);
    handoutMutation.mutate(
      {
        venueId,
        venueName,
        personId: values.person.personId,
        personName: toPersonName(values.person),
        sinceOn: values.sinceOn,
      },
      { onSuccess: (created) => landBack(created.keyHoldingId), onError: fail },
    );
  });

  const submitReturn = returnForm.handleSubmit((values) => {
    if (holding === null) {
      return;
    }

    setRejection(null);
    returnMutation.mutate(
      {
        keyHoldingId: holding.keyHoldingId,
        personName: toPersonName(holding),
        untilOn: values.untilOn,
      },
      { onSuccess: () => landBack(holding.keyHoldingId), onError: fail },
    );
  });

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
    setSinceOn: sinceOnField.field.onChange,
    sinceOnError: handoutState.errors.sinceOn?.message,
    untilOn,
    setUntilOn: untilOnField.field.onChange,
    untilOnError: returnState.errors.untilOn?.message,
    consequence,
    rejection,
    isSaving: isEditing ? returnMutation.isPending : handoutMutation.isPending,
    isDirty: isEditing ? isReturnDirty : isHandoutDirty,
    canSubmit: isEditing ? isReturnValid : isHandoutValid,
    actionLabel: isEditing ? RETURN_LABEL : HANDOUT_LABEL,
    submit: () => {
      void (isEditing ? submitReturn() : submitHandout());
    },
  };
};
