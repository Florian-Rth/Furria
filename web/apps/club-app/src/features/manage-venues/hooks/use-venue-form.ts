import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
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

interface VenueFormInput {
  venue: ManagedVenue | null;
  open: boolean;
  onSaved: (venueId: number) => void;
}

export interface VenueFormControl {
  form: UseFormReturn<VenueForm>;
  hint: string;
  setHint: (value: string) => void;
  isEditing: boolean;
  isSaving: boolean;
  rejection: string | null;
  submit: () => void;
}

export const useVenueForm = ({ venue, open, onSaved }: VenueFormInput): VenueFormControl => {
  const [rejection, setRejection] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(open);
  const createMutation = useCreateVenueMutation();
  const updateMutation = useUpdateVenueMutation();

  const form = useForm<VenueForm>({
    resolver: zodResolver(VenueFormSchema),
    defaultValues: toValues(venue),
  });

  if (wasOpen !== open) {
    setWasOpen(open);

    if (open) {
      form.reset(toValues(venue));
      setRejection(null);
    }
  }

  const showFailure = (error: Error): void => {
    const failures = toFormFailures(error, FIELD_NAMES);

    for (const failure of failures.fields) {
      form.setError(failure.name, { message: failure.message });
    }

    const fallback = failures.fields.length === 0 ? toWriteErrorMessage(error) : null;

    setRejection(failures.footer ?? fallback);
  };

  const handleSubmit = form.handleSubmit((values) => {
    setRejection(null);

    if (venue === null) {
      createMutation.mutate(values, {
        onSuccess: (created) => {
          onSaved(created.venueId);
        },
        onError: showFailure,
      });
      return;
    }

    updateMutation.mutate(
      { venueId: venue.venueId, form: values },
      {
        onSuccess: () => {
          onSaved(venue.venueId);
        },
        onError: showFailure,
      },
    );
  });

  const submit = (): void => {
    void handleSubmit();
  };

  const setHint = (value: string): void => {
    form.setValue('hint', value, { shouldValidate: true });
  };

  return {
    form,
    hint: form.watch('hint'),
    setHint,
    isEditing: venue !== null,
    isSaving: createMutation.isPending || updateMutation.isPending,
    rejection,
    submit,
  };
};
