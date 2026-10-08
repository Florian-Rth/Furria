import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import type { CalendarDayTime } from '@/features/calendar';
import { toEndKeptInStep } from '@/features/calendar';
import { toLandingKey } from '@/features/write';
import { toFormFailures } from '@/lib/api/api-failures';
import { useGoBackTo } from '@/lib/use-go-back-to';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useCreateEventMutation, useUpdateEventMutation } from '../api';
import { toEventFormValues, toEventPayload } from '../event-form';
import type { EventDetails, EventForm } from '../schemas';
import { EventFormSchema } from '../schemas';

const FIELD_NAMES = [
  'title',
  'teaser',
  'description',
  'ageHint',
  'venueId',
  'doorsOpenAt',
] as const;
const LANDING_KIND = 'event';
const FIELD_EDIT = { shouldDirty: true, shouldValidate: true } as const;
const NO_DAY = '';

export interface EventEditorControl {
  form: UseFormReturn<EventForm>;
  values: EventForm;
  setStartDay: (value: string | null) => void;
  setStartTime: (value: string) => void;
  setEndDay: (value: string | null) => void;
  setEndTime: (value: string) => void;
  setDoorsOpenAt: (value: string) => void;
  setVenue: (value: string) => void;
  setTeaser: (value: string) => void;
  setDescription: (value: string) => void;
  setPresaleDay: (value: string | null) => void;
  setPresaleTime: (value: string) => void;
  isEditing: boolean;
  isDirty: boolean;
  canSubmit: boolean;
  isSaving: boolean;
  rejection: string | null;
  submit: () => void;
}

export const useEventEditor = (event: EventDetails | null): EventEditorControl => {
  const [today] = useState(() => new Date());
  const [rejection, setRejection] = useState<string | null>(null);
  const createMutation = useCreateEventMutation();
  const updateMutation = useUpdateEventMutation();
  const goBackTo = useGoBackTo();

  const form = useForm<EventForm>({
    resolver: zodResolver(EventFormSchema),
    defaultValues: toEventFormValues(event, today),
    mode: 'onTouched',
  });
  const { isDirty, isValid } = form.formState;
  const values = form.watch();

  const landOn = (eventId: number): void => {
    void goBackTo({
      to: '/events/$eventId',
      params: { eventId: String(eventId) },
      search: (previous) => ({ ...previous, changed: toLandingKey(LANDING_KIND, eventId) }),
      ignoreBlocker: true,
    });
  };

  const showFailure = (error: Error): void => {
    const failures = toFormFailures(error, FIELD_NAMES);

    for (const failure of failures.fields) {
      form.setError(failure.name, { message: failure.message });
    }

    const fallback = failures.fields.length === 0 ? toWriteErrorMessage(error) : null;

    setRejection(failures.footer ?? fallback);
  };

  const handleSubmit = form.handleSubmit((submitted) => {
    setRejection(null);
    const payload = toEventPayload(submitted);

    if (event === null) {
      createMutation.mutate(payload, {
        onSuccess: (written) => landOn(written.eventId),
        onError: showFailure,
      });
      return;
    }

    updateMutation.mutate(
      { eventId: event.eventId, payload },
      { onSuccess: (written) => landOn(written.eventId), onError: showFailure },
    );
  });

  const keepEndInStep = (nextStart: CalendarDayTime): void => {
    const endDay = form.getValues('endDay');

    if (endDay === NO_DAY) {
      return;
    }

    const previousStart: CalendarDayTime = {
      day: form.getValues('startDay'),
      time: form.getValues('startTime'),
    };
    const kept = toEndKeptInStep(previousStart, nextStart, {
      day: endDay,
      time: form.getValues('endTime'),
    });

    form.setValue('endDay', kept.day, FIELD_EDIT);
    form.setValue('endTime', kept.time, FIELD_EDIT);
  };

  const setField =
    (name: 'endTime' | 'doorsOpenAt' | 'venueId' | 'teaser' | 'description' | 'presaleTime') =>
    (value: string): void => {
      form.setValue(name, value, FIELD_EDIT);
    };

  const setDay =
    (name: 'endDay' | 'presaleDay') =>
    (value: string | null): void => {
      form.setValue(name, value ?? NO_DAY, FIELD_EDIT);
    };

  return {
    form,
    values,
    setStartDay: (value) => {
      const day = value ?? NO_DAY;

      keepEndInStep({ day, time: form.getValues('startTime') });
      form.setValue('startDay', day, FIELD_EDIT);
    },
    setStartTime: (value) => {
      keepEndInStep({ day: form.getValues('startDay'), time: value });
      form.setValue('startTime', value, FIELD_EDIT);
    },
    setEndDay: setDay('endDay'),
    setEndTime: setField('endTime'),
    setDoorsOpenAt: setField('doorsOpenAt'),
    setVenue: setField('venueId'),
    setTeaser: setField('teaser'),
    setDescription: setField('description'),
    setPresaleDay: setDay('presaleDay'),
    setPresaleTime: setField('presaleTime'),
    isEditing: event !== null,
    isDirty,
    canSubmit: isValid,
    isSaving: createMutation.isPending || updateMutation.isPending,
    rejection,
    submit: () => {
      void handleSubmit();
    },
  };
};
