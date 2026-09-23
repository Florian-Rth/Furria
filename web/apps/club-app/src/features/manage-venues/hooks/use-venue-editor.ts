import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useController, useForm } from 'react-hook-form';
import { toLandingKey } from '@/features/write';
import { toFormFailures } from '@/lib/api/api-failures';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useCreateVenueMutation, useUpdateVenueMutation } from '../api';
import type { ManagedVenue, VenueForm } from '../schemas';
import { VenueFormSchema } from '../schemas';

const FIELD_NAMES = ['name', 'street', 'zip', 'city', 'hint'] as const;

const EMPTY_VALUES: VenueForm = { name: '', street: '', zip: '', city: '', hint: '' };

const toValues = (venue: ManagedVenue | null): VenueForm =>
  venue === null
    ? EMPTY_VALUES
    : {
        name: venue.name,
        street: venue.street,
        zip: venue.zip,
        city: venue.city,
        hint: venue.hint ?? '',
      };

export interface VenueEditorControl {
  form: UseFormReturn<VenueForm>;
  hint: string;
  setHint: (value: string) => void;
  touchHint: () => void;
  isDirty: boolean;
  canSubmit: boolean;
  isSaving: boolean;
  rejection: string | null;
  submit: () => void;
}

export const useVenueEditor = (venue: ManagedVenue | null): VenueEditorControl => {
  const [rejection, setRejection] = useState<string | null>(null);
  const createMutation = useCreateVenueMutation();
  const updateMutation = useUpdateVenueMutation();
  const navigate = useNavigate();

  const form = useForm<VenueForm>({
    resolver: zodResolver(VenueFormSchema),
    defaultValues: toValues(venue),
    mode: 'onTouched',
  });
  const { isDirty, isValid } = form.formState;
  const hint = useController({ control: form.control, name: 'hint' });

  const showFailure = (error: Error): void => {
    const failures = toFormFailures(error, FIELD_NAMES);

    for (const failure of failures.fields) {
      form.setError(failure.name, { message: failure.message });
    }

    const fallback = failures.fields.length === 0 ? toWriteErrorMessage(error) : null;

    setRejection(failures.footer ?? fallback);
  };

  const landOn = (venueId: number): void => {
    void navigate({
      to: '/manage/venues/$venueId',
      params: { venueId: String(venueId) },
      search: (previous) => ({ ...previous, changed: toLandingKey('venue', venueId) }),
      replace: true,
    });
  };

  const handleSubmit = form.handleSubmit((values) => {
    setRejection(null);

    if (venue === null) {
      createMutation.mutate(values, {
        onSuccess: (created) => {
          landOn(created.venueId);
        },
        onError: showFailure,
      });
      return;
    }

    updateMutation.mutate(
      { venueId: venue.venueId, form: values },
      {
        onSuccess: () => {
          landOn(venue.venueId);
        },
        onError: showFailure,
      },
    );
  });

  const submit = (): void => {
    void handleSubmit();
  };

  return {
    form,
    hint: hint.field.value,
    setHint: hint.field.onChange,
    touchHint: hint.field.onBlur,
    isDirty,
    canSubmit: isValid,
    isSaving: createMutation.isPending || updateMutation.isPending,
    rejection,
    submit,
  };
};
