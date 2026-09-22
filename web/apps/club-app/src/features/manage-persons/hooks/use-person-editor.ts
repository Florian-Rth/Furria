import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import type { FieldErrors, UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { toLandingKey } from '@/features/write';
import { RequestFailedError } from '@/lib/api/api-error';
import { toCamelCaseField } from '@/lib/api/api-failures';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useCreatePersonMutation, useUpdatePersonMutation } from '../api';
import type { CreatedPerson, PersonForm } from '../schemas';
import { PersonFormSchema } from '../schemas';

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

const FIELD_ERROR_STATUS = 400;
const UNSAVED_PERSON_ID = 0;
const CREATE_LABEL = 'Hinzufügen';
const SAVE_LABEL = 'Speichern';

const PERSON_FIELD_NAMES = [
  'firstName',
  'lastName',
  'email',
  'phone',
  'street',
  'zip',
  'city',
  'birthDate',
] as const;

type PersonFieldName = (typeof PERSON_FIELD_NAMES)[number];

const isPersonFieldName = (value: string): value is PersonFieldName =>
  PERSON_FIELD_NAMES.some((name) => name === value);

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
  isSaving: boolean;
  rejection: string | null;
  actionLabel: string;
  submit: () => void;
}

export const usePersonEditor = ({ person }: PersonEditorInput): PersonEditorControl => {
  const [rejection, setRejection] = useState<string | null>(null);
  const create = useCreatePersonMutation();
  const update = useUpdatePersonMutation(person?.personId ?? UNSAVED_PERSON_ID);
  const navigate = useNavigate();

  const form = useForm<PersonForm>({
    resolver: zodResolver(PersonFormSchema),
    defaultValues: toPersonFormValues(person),
  });

  const reject = (error: Error): void => {
    if (error instanceof RequestFailedError && error.status === FIELD_ERROR_STATUS) {
      const unmatched = error.failures.filter((failure) => {
        const field = toCamelCaseField(failure.field);

        if (!isPersonFieldName(field)) {
          return true;
        }

        form.setError(field, { message: failure.message });

        return false;
      });

      setRejection(unmatched[0]?.message ?? null);

      return;
    }

    setRejection(toWriteErrorMessage(error));
  };

  const landOnPerson = (personId: number): void => {
    void navigate({
      to: '/manage/persons/$personId',
      params: { personId: String(personId) },
      search: (previous) => ({ ...previous, changed: toLandingKey('person', personId) }),
      replace: true,
    });
  };

  const handleFormSubmit = form.handleSubmit((values) => {
    setRejection(null);

    if (person === null) {
      create.mutate(values, {
        onSuccess: (created: CreatedPerson) => landOnPerson(created.personId),
        onError: reject,
      });

      return;
    }

    update.mutate(values, { onSuccess: () => landOnPerson(person.personId), onError: reject });
  });

  return {
    form,
    errors: form.formState.errors,
    birthDate: form.watch('birthDate'),
    setBirthDate: (value) => {
      form.setValue('birthDate', value, { shouldDirty: true });
    },
    isDirty: form.formState.isDirty,
    isSaving: create.isPending || update.isPending,
    rejection,
    actionLabel: person === null ? CREATE_LABEL : SAVE_LABEL,
    submit: () => {
      void handleFormSubmit();
    },
  };
};
