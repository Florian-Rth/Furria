import type { UseFormReturn } from 'react-hook-form';
import { useController } from 'react-hook-form';
import { useWriteForm } from '@/features/write/hooks/use-write-form';
import { useCreateVenueMutation, useUpdateVenueMutation } from '../api';
import type { ManagedVenue, VenueForm } from '../schemas';
import { VenueFormSchema } from '../schemas';

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
  const createMutation = useCreateVenueMutation();
  const updateMutation = useUpdateVenueMutation();

  const write = useWriteForm({
    schema: VenueFormSchema,
    defaults: toValues(venue),
    mutate: (values) =>
      venue === null
        ? createMutation.mutateAsync(values).then((created) => created.venueId)
        : updateMutation
            .mutateAsync({ venueId: venue.venueId, form: values })
            .then(() => venue.venueId),
    landing: (venueId) => ({
      to: '/manage/venues/$venueId',
      params: { venueId },
      mark: { kind: 'venue', id: venueId },
    }),
  });
  const hint = useController({ control: write.form.control, name: 'hint' });

  return {
    ...write,
    hint: hint.field.value,
    setHint: hint.field.onChange,
    touchHint: hint.field.onBlur,
  };
};
