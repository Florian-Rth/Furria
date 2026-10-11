import type { KkPublishCeremonyRun, KkPublishStamp } from '@furria/ui';
import { useKkPublishCeremony } from '@furria/ui';
import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { CalendarDayTime } from '@/features/calendar';
import { toEndKeptInStep } from '@/features/calendar';
import { useSignerName } from '@/features/session';
import { useWriteForm } from '@/features/write';
import { PUBLISHED_STAMP, websiteAddressOf } from '@/lib/publish-copy';
import { useCreateEventMutation, useUpdateEventMutation } from '../api';
import { toEventFormValues, toEventPayload } from '../event-form';
import type { EventDetails, EventForm, WrittenEvent } from '../schemas';
import { EventFormSchema } from '../schemas';

const LANDING_KIND = 'event';
const FIELD_EDIT = { shouldDirty: true, shouldValidate: true } as const;
const NO_DAY = '';
const PUBLIC_EVENTS_PATH = '/events/';

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
  ceremony: KkPublishCeremonyRun<WrittenEvent>;
  rejection: string | null;
  submit: () => void;
}

export const useEventEditor = (event: EventDetails | null): EventEditorControl => {
  const [today] = useState(() => new Date());
  const createMutation = useCreateEventMutation();
  const updateMutation = useUpdateEventMutation();
  const signer = useSignerName();

  const stampOf = (written: WrittenEvent, stampedAt: string): KkPublishStamp => ({
    title: PUBLISHED_STAMP,
    signer,
    at: stampedAt,
    address: websiteAddressOf(`${PUBLIC_EVENTS_PATH}${written.eventId}`),
  });

  const ceremony = useKkPublishCeremony({ stampOf });

  const write = useWriteForm({
    schema: EventFormSchema,
    defaults: toEventFormValues(event, today),
    mutate: (submitted) => {
      const payload = toEventPayload(submitted);

      return event === null
        ? ceremony.perform(() => createMutation.mutateAsync(payload))
        : updateMutation.mutateAsync({ eventId: event.eventId, payload });
    },
    landing: ({ eventId }) => ({
      to: '/events/$eventId',
      params: { eventId },
      mark: { kind: LANDING_KIND, id: eventId },
    }),
  });
  const { form } = write;
  const values = form.watch();

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
    isDirty: write.isDirty,
    canSubmit: write.canSubmit,
    isSaving: write.isSaving,
    ceremony,
    rejection: write.rejection,
    submit: write.submit,
  };
};
