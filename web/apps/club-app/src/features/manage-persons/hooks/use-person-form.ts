import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import { useState } from 'react';
import type { FieldErrors, UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { RequestFailedError } from '@/lib/api/api-error';
import { toCamelCaseField } from '@/lib/api/api-failures';
import { useCreatePersonMutation, useUpdatePersonMutation } from '../api';
import { toWriteErrorMessage } from '../manage-persons-messages';
import type { PersonForm } from '../schemas';
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

export const toPersonFormValues = (person: PersonFormSource | null): PersonForm => {
  if (person === null) {
    return EMPTY_PERSON;
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
    contactVisibleToMembers: person.contactVisibleToMembers,
  };
};

interface PersonFormInput {
  person: PersonFormSource | null;
  open: boolean;
  onSaved: () => void;
}

export interface PersonFormControl {
  form: UseFormReturn<PersonForm>;
  errors: FieldErrors<PersonForm>;
  submit: (event: FormEvent<HTMLFormElement>) => void;
  birthDate: string | null;
  setBirthDate: (value: string | null) => void;
  contactVisibleToMembers: boolean;
  setContactVisibleToMembers: (value: boolean) => void;
  isSaving: boolean;
  rejection: string | null;
}

export const usePersonForm = ({ person, open, onSaved }: PersonFormInput): PersonFormControl => {
  const [rejection, setRejection] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(open);
  const create = useCreatePersonMutation();
  const update = useUpdatePersonMutation(person?.personId ?? 0);

  const form = useForm<PersonForm>({
    resolver: zodResolver(PersonFormSchema),
    defaultValues: toPersonFormValues(person),
  });

  if (wasOpen !== open) {
    setWasOpen(open);

    if (open) {
      form.reset(toPersonFormValues(person));
      setRejection(null);
    }
  }

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

  const handleFormSubmit = form.handleSubmit((values) => {
    setRejection(null);

    if (person === null) {
      create.mutate(values, { onSuccess: onSaved, onError: reject });

      return;
    }

    update.mutate(values, { onSuccess: onSaved, onError: reject });
  });

  const birthDate = form.watch('birthDate');
  const contactVisibleToMembers = form.watch('contactVisibleToMembers');

  return {
    form,
    errors: form.formState.errors,
    submit: (event) => {
      void handleFormSubmit(event);
    },
    birthDate,
    setBirthDate: (value) => {
      form.setValue('birthDate', value, { shouldDirty: true });
    },
    contactVisibleToMembers,
    setContactVisibleToMembers: (value) => {
      form.setValue('contactVisibleToMembers', value, { shouldDirty: true });
    },
    isSaving: create.isPending || update.isPending,
    rejection,
  };
};
