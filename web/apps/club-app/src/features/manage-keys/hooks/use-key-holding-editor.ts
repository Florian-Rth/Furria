import { useController } from 'react-hook-form';
import { useWriteForm } from '@/features/write/hooks/use-write-form';
import type { WriteLanding } from '@/features/write/landing-target';
import type { PersonRef } from '@/lib/api/schemas';
import { toIsoDay } from '@/lib/day';
import { useHandOutKeyMutation, useTakeBackKeyMutation } from '../api';
import { toHandoutConsequence, toPersonName, toReturnConsequence } from '../manage-keys-labels';
import type { KeyHolding } from '../schemas';
import { KeyHandoutFormSchema, KeyReturnFormSchema } from '../schemas';

const HANDOUT_LABEL = 'Schlüssel ausgeben';
const RETURN_LABEL = 'Schlüssel zurücknehmen';
const KEYS_ROUTE = '/manage/keys';

const toKeysLanding = (keyHoldingId: number): WriteLanding => ({
  to: KEYS_ROUTE,
  mark: { kind: 'keyHolding', id: keyHoldingId },
});

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
  const handoutMutation = useHandOutKeyMutation();
  const returnMutation = useTakeBackKeyMutation();

  const handout = useWriteForm({
    schema: KeyHandoutFormSchema,
    defaults: { person: null, sinceOn: today },
    mutate: (values) =>
      handoutMutation
        .mutateAsync({
          venueId,
          venueName,
          personId: values.person.personId,
          personName: toPersonName(values.person),
          sinceOn: values.sinceOn,
        })
        .then((created) => created.keyHoldingId),
    landing: toKeysLanding,
  });
  const takeBack = useWriteForm({
    schema: KeyReturnFormSchema,
    defaults: { untilOn: holding?.untilOn ?? today },
    mutate: (values) =>
      holding === null
        ? null
        : returnMutation
            .mutateAsync({
              keyHoldingId: holding.keyHoldingId,
              personName: toPersonName(holding),
              untilOn: values.untilOn,
            })
            .then(() => holding.keyHoldingId),
    landing: toKeysLanding,
  });
  const personField = useController({ control: handout.form.control, name: 'person' });
  const sinceOnField = useController({ control: handout.form.control, name: 'sinceOn' });
  const untilOnField = useController({ control: takeBack.form.control, name: 'untilOn' });

  const person = personField.field.value;
  const sinceOn = sinceOnField.field.value;
  const untilOn = untilOnField.field.value;
  const personName = person === null ? '' : toPersonName(person);
  const write = holding === null ? handout : takeBack;

  const consequence =
    holding !== null
      ? untilOn === null
        ? null
        : toReturnConsequence(holding.firstName, venueName, untilOn, today)
      : person === null || sinceOn === null
        ? null
        : toHandoutConsequence(personName, venueName, sinceOn, today);

  return {
    isEditing: holding !== null,
    person,
    select: personField.field.onChange,
    clearPerson: () => {
      personField.field.onChange(null);
    },
    sinceOn,
    setSinceOn: sinceOnField.field.onChange,
    sinceOnError: handout.form.formState.errors.sinceOn?.message,
    untilOn,
    setUntilOn: untilOnField.field.onChange,
    untilOnError: takeBack.form.formState.errors.untilOn?.message,
    consequence,
    rejection: write.rejection,
    isSaving: write.isSaving,
    isDirty: write.isDirty,
    canSubmit: write.canSubmit,
    actionLabel: holding === null ? HANDOUT_LABEL : RETURN_LABEL,
    submit: write.submit,
  };
};
