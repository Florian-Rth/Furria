import type { KkPublishCeremonyRun, KkPublishStamp } from '@furria/ui';
import { useKkPublishCeremony } from '@furria/ui';
import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useSignerName } from '@/features/session';
import { useWriteForm } from '@/features/write';
import { PUBLISHED_STAMP, websiteAddressOf } from '@/lib/publish-copy';
import { useCreateEventMutation, useUpdateEventMutation } from '../api';
import { toEventFormValues, toEventPayload } from '../event-form';
import type { EventDetails, EventForm, WrittenEvent } from '../schemas';
import { EventFormSchema } from '../schemas';
import type { StagedEventPictureDesk } from './use-staged-event-picture';
import { useStagedEventPicture } from './use-staged-event-picture';

const LANDING_KIND = 'event';
const FIELD_EDIT = { shouldDirty: true, shouldValidate: true } as const;
const NO_DAY = '';
const PUBLIC_EVENTS_PATH = '/events/';
const START_DEPENDENTS: (keyof EventForm)[] = ['doorsOpenAt', 'presaleTime'];

export interface EventEditorControl {
  form: UseFormReturn<EventForm>;
  values: EventForm;
  setStartDay: (value: string | null) => void;
  setStartTime: (value: string) => void;
  setDoorsOpenAt: (value: string) => void;
  setVenue: (value: string) => void;
  setTeaser: (value: string) => void;
  setDescription: (value: string) => void;
  setAgeHint: (value: string) => void;
  setPrice: (value: string) => void;
  setPresaleDay: (value: string | null) => void;
  setPresaleTime: (value: string) => void;
  isEditing: boolean;
  isDirty: boolean;
  canSubmit: boolean;
  isSaving: boolean;
  ceremony: KkPublishCeremonyRun<WrittenEvent>;
  stagedPicture: StagedEventPictureDesk;
  rejection: string | null;
  submit: () => void;
}

export const useEventEditor = (event: EventDetails | null): EventEditorControl => {
  const [today] = useState(() => new Date());
  const createMutation = useCreateEventMutation();
  const updateMutation = useUpdateEventMutation();
  const signer = useSignerName();
  const stagedPicture = useStagedEventPicture();

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
        ? ceremony.perform(async () => {
            const written = await createMutation.mutateAsync(payload);
            await stagedPicture.sendTo(written.eventId);

            return written;
          })
        : updateMutation.mutateAsync({ eventId: event.eventId, payload });
    },
    landing: ({ eventId }) => ({
      to: '/events/$eventId',
      params: { eventId },
      mark: { kind: LANDING_KIND, id: eventId },
    }),
  });
  const { form, values } = write;

  const setField =
    (
      name:
        | 'startTime'
        | 'doorsOpenAt'
        | 'venueId'
        | 'teaser'
        | 'description'
        | 'ageHint'
        | 'price'
        | 'presaleTime',
    ) =>
    (value: string): void => {
      form.setValue(name, value, FIELD_EDIT);
    };

  const setDay =
    (name: 'startDay' | 'presaleDay') =>
    (value: string | null): void => {
      form.setValue(name, value ?? NO_DAY, FIELD_EDIT);
    };

  return {
    form,
    values,
    setStartDay: (value) => {
      setDay('startDay')(value);
      void form.trigger(START_DEPENDENTS);
    },
    setStartTime: (value) => {
      setField('startTime')(value);
      void form.trigger(START_DEPENDENTS);
    },
    setDoorsOpenAt: setField('doorsOpenAt'),
    setVenue: setField('venueId'),
    setTeaser: setField('teaser'),
    setDescription: setField('description'),
    setAgeHint: setField('ageHint'),
    setPrice: setField('price'),
    setPresaleDay: setDay('presaleDay'),
    setPresaleTime: setField('presaleTime'),
    isEditing: event !== null,
    isDirty: write.isDirty,
    canSubmit: write.canSubmit,
    isSaving: write.isSaving,
    ceremony,
    stagedPicture,
    rejection: write.rejection,
    submit: write.submit,
  };
};
