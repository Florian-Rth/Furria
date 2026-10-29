import type { OpeningWeekday } from '@furria/api-client/opening-hours';
import type { UseFormReturn } from 'react-hook-form';
import { useController, useFieldArray } from 'react-hook-form';
import { useWriteForm } from '@/features/write/hooks/use-write-form';
import { useCreateVenueMutation, useUpdateVenueMutation } from '../api';
import { nextOpeningSlotOf, toOpeningSlotForms } from '../opening-hours-form';
import type { ManagedVenue, VenueForm, VenueOpeningSlotForm } from '../schemas';
import { VENUE_OPENING_SLOTS_MAX, VenueFormSchema, VenueOpeningSlotFormSchema } from '../schemas';

const EMPTY_VALUES: VenueForm = {
  name: '',
  street: '',
  zip: '',
  city: '',
  hint: '',
  openingHours: [],
};
const FIELD_EDIT = { shouldDirty: true } as const;
const OPENING_HOURS = 'openingHours';

const toValues = (venue: ManagedVenue | null): VenueForm =>
  venue === null
    ? EMPTY_VALUES
    : {
        name: venue.name,
        street: venue.street,
        zip: venue.zip,
        city: venue.city,
        hint: venue.hint ?? '',
        openingHours: toOpeningSlotForms(venue.openingHours),
      };

const toWeekday = (value: string, fallback: OpeningWeekday): OpeningWeekday => {
  const parsed = VenueOpeningSlotFormSchema.shape.weekday.safeParse(value);

  return parsed.success ? parsed.data : fallback;
};

export interface OpeningSlotControl {
  key: string;
  slot: VenueOpeningSlotForm;
  weekdayError: string | undefined;
  opensError: string | undefined;
  closesError: string | undefined;
  setWeekday: (value: string) => void;
  setOpens: (value: string) => void;
  setCloses: (value: string) => void;
  remove: () => void;
}

export interface VenueEditorControl {
  form: UseFormReturn<VenueForm>;
  hint: string;
  setHint: (value: string) => void;
  touchHint: () => void;
  openingSlots: OpeningSlotControl[];
  canAddOpeningSlot: boolean;
  addOpeningSlot: () => void;
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
  const { form, values } = write;
  const hint = useController({ control: form.control, name: 'hint' });
  const slots = useFieldArray({ control: form.control, name: OPENING_HOURS });
  const slotErrors = form.formState.errors.openingHours;

  const checkOpeningHours = (): void => {
    void form.trigger(OPENING_HOURS);
  };

  const openingSlots = slots.fields.map((field, index): OpeningSlotControl => {
    const slot = values.openingHours[index] ?? field;
    const errors = slotErrors?.[index];

    return {
      key: field.id,
      slot,
      weekdayError: errors?.weekday?.message,
      opensError: errors?.opens?.message,
      closesError: errors?.closes?.message,
      setWeekday: (value) => {
        form.setValue(`openingHours.${index}.weekday`, toWeekday(value, slot.weekday), FIELD_EDIT);
        checkOpeningHours();
      },
      setOpens: (value) => {
        form.setValue(`openingHours.${index}.opens`, value, FIELD_EDIT);
        checkOpeningHours();
      },
      setCloses: (value) => {
        form.setValue(`openingHours.${index}.closes`, value, FIELD_EDIT);
        checkOpeningHours();
      },
      remove: () => {
        slots.remove(index);
        checkOpeningHours();
      },
    };
  });

  return {
    form,
    hint: hint.field.value,
    setHint: hint.field.onChange,
    touchHint: hint.field.onBlur,
    openingSlots,
    canAddOpeningSlot: values.openingHours.length < VENUE_OPENING_SLOTS_MAX,
    addOpeningSlot: () => {
      slots.append(nextOpeningSlotOf(values.openingHours));
      checkOpeningHours();
    },
    isDirty: write.isDirty,
    canSubmit: write.canSubmit,
    isSaving: write.isSaving,
    rejection: write.rejection,
    submit: write.submit,
  };
};
