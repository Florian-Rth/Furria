import type { FieldErrors, UseFormReturn } from 'react-hook-form';
import { useController, useWatch } from 'react-hook-form';
import { useWriteForm } from '@/features/write/hooks/use-write-form';
import { useCreatePersonMutation, useUpdatePersonMutation } from '../api';
import type { PersonForm } from '../schemas';
import { PersonFormSchema } from '../schemas';
import type { AdoptionSuggestionControl } from './use-adoption-suggestion';
import { useAdoptionSuggestion } from './use-adoption-suggestion';

export interface PersonFormSource {
  personId: number;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  street: string | null;
  zip: string | null;
  city: string | null;
  birthDate: string | null;
  contactVisibleToMembers: boolean;
}

const UNSAVED_PERSON_ID = 0;
const CREATE_LABEL = 'Hinzufügen';
const SAVE_LABEL = 'Speichern';

const EMPTY_PERSON: PersonForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  street: '',
  zip: '',
  city: '',
  birthDate: null,
  contactVisibleToMembers: false,
};

export interface PersonFormOverrides {
  contactVisibleToMembers?: boolean;
}

export const toPersonFormValues = (
  person: PersonFormSource | null,
  overrides: PersonFormOverrides = {},
): PersonForm => {
  if (person === null) {
    return { ...EMPTY_PERSON, ...overrides };
  }

  return {
    firstName: person.firstName,
    lastName: person.lastName,
    email: person.email ?? '',
    phone: person.phone ?? '',
    street: person.street ?? '',
    zip: person.zip ?? '',
    city: person.city ?? '',
    birthDate: person.birthDate,
    contactVisibleToMembers: overrides.contactVisibleToMembers ?? person.contactVisibleToMembers,
  };
};

interface PersonEditorInput {
  person: PersonFormSource | null;
}

export interface PersonEditorControl {
  form: UseFormReturn<PersonForm>;
  errors: FieldErrors<PersonForm>;
  birthDate: string | null;
  setBirthDate: (value: string | null) => void;
  isDirty: boolean;
  canSubmit: boolean;
  isSaving: boolean;
  rejection: string | null;
  actionLabel: string;
  adoption: AdoptionSuggestionControl;
  submit: () => void;
}

export const usePersonEditor = ({ person }: PersonEditorInput): PersonEditorControl => {
  const create = useCreatePersonMutation();
  const update = useUpdatePersonMutation(person?.personId ?? UNSAVED_PERSON_ID);

  const write = useWriteForm({
    schema: PersonFormSchema,
    defaults: toPersonFormValues(person),
    mutate: (values) =>
      person === null
        ? create.mutateAsync(values).then((created) => created.personId)
        : update.mutateAsync(values).then(() => person.personId),
    landing: (personId) => ({
      to: '/manage/persons/$personId',
      params: { personId },
      mark: { kind: 'person', id: personId },
    }),
  });
  const birthDate = useController({ control: write.form.control, name: 'birthDate' });
  const typedEmail = useWatch({ control: write.form.control, name: 'email' });
  const adoption = useAdoptionSuggestion(typedEmail, person === null);

  return {
    ...write,
    errors: write.form.formState.errors,
    birthDate: birthDate.field.value,
    setBirthDate: birthDate.field.onChange,
    actionLabel: person === null ? CREATE_LABEL : SAVE_LABEL,
    adoption,
  };
};
