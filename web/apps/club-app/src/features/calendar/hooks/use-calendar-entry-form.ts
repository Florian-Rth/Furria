import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { toFormFailures } from '@/lib/api/api-failures';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useCreateCalendarEntryMutation, useUpdateCalendarEntryMutation } from '../api';
import type { CalendarDayTime, CalendarOwnerOption } from '../calendar-authoring';
import {
  toCalendarKind,
  toCalendarVisibility,
  toCollisionName,
  toCollisionSentence,
  toDefaultVisibility,
  toEndKeptInStep,
  toEntryFormValues,
  toEntryPayload,
} from '../calendar-authoring';
import type { CalendarEntry, CalendarEntryForm, WrittenCalendarEntry } from '../schemas';
import { CalendarEntryFormSchema } from '../schemas';

const FIELD_NAMES = ['title', 'description'] as const;

interface CalendarEntryFormInput {
  entry: CalendarEntry | null;
  ownerOptions: readonly CalendarOwnerOption[];
  open: boolean;
  onSaved: () => void;
}

export interface CalendarEntryFormControl {
  form: UseFormReturn<CalendarEntryForm>;
  values: CalendarEntryForm;
  setDescription: (value: string) => void;
  setOwner: (value: string) => void;
  setVenue: (value: string) => void;
  setKind: (value: string) => void;
  setVisibility: (value: string) => void;
  setStartDay: (value: string | null) => void;
  setStartTime: (value: string) => void;
  setEndDay: (value: string | null) => void;
  setEndTime: (value: string) => void;
  setAsksForResponse: (value: boolean) => void;
  isEditing: boolean;
  isSaving: boolean;
  rejection: string | null;
  collisionWarning: string | null;
  submit: () => void;
}

export const useCalendarEntryForm = ({
  entry,
  ownerOptions,
  open,
  onSaved,
}: CalendarEntryFormInput): CalendarEntryFormControl => {
  const [today] = useState(() => new Date());
  const [rejection, setRejection] = useState<string | null>(null);
  const [collisionWarning, setCollisionWarning] = useState<string | null>(null);
  const [writtenEntryId, setWrittenEntryId] = useState<number | null>(null);
  const [wasOpen, setWasOpen] = useState(open);
  const createMutation = useCreateCalendarEntryMutation();
  const updateMutation = useUpdateCalendarEntryMutation();

  const form = useForm<CalendarEntryForm>({
    resolver: zodResolver(CalendarEntryFormSchema),
    defaultValues: toEntryFormValues(entry, ownerOptions, today),
  });

  if (wasOpen !== open) {
    setWasOpen(open);

    if (open) {
      form.reset(toEntryFormValues(entry, ownerOptions, today));
      setRejection(null);
      setCollisionWarning(null);
      setWrittenEntryId(null);
    }
  }

  const values = form.watch();

  const showFailure = (error: Error): void => {
    const failures = toFormFailures(error, FIELD_NAMES);

    for (const failure of failures.fields) {
      form.setError(failure.name, { message: failure.message });
    }

    const fallback = failures.fields.length === 0 ? toWriteErrorMessage(error) : null;

    setRejection(failures.footer ?? fallback);
  };

  const settle = (written: WrittenCalendarEntry): void => {
    setWrittenEntryId(written.calendarEntryId);

    if (written.venueCollisions.length === 0) {
      onSaved();
      return;
    }

    setCollisionWarning(toCollisionSentence(written.venueCollisions.map(toCollisionName)));
  };

  const handleSubmit = form.handleSubmit((submitted) => {
    setRejection(null);
    setCollisionWarning(null);
    const payload = toEntryPayload(submitted);
    const targetId = entry?.calendarEntryId ?? writtenEntryId;

    if (targetId === null) {
      createMutation.mutate({ payload }, { onSuccess: settle, onError: showFailure });
      return;
    }

    updateMutation.mutate(
      { calendarEntryId: targetId, payload },
      { onSuccess: settle, onError: showFailure },
    );
  });

  const ownerGroupIdOf = (ownerId: string): number | null =>
    ownerOptions.find((option) => option.id === ownerId)?.ownerGroupId ?? null;

  const setOwner = (value: string): void => {
    form.setValue('ownerId', value);
    form.setValue('visibility', toDefaultVisibility(ownerGroupIdOf(value), form.getValues('kind')));
  };

  const keepEndInStep = (nextStart: CalendarDayTime): void => {
    const endDay = form.getValues('endDay');

    if (endDay === '') {
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

    form.setValue('endDay', kept.day);
    form.setValue('endTime', kept.time);
  };

  const setStartDay = (value: string | null): void => {
    const day = value ?? '';

    keepEndInStep({ day, time: form.getValues('startTime') });
    form.setValue('startDay', day, { shouldValidate: true });
  };

  const setStartTime = (value: string): void => {
    keepEndInStep({ day: form.getValues('startDay'), time: value });
    form.setValue('startTime', value, { shouldValidate: true });
  };

  const setKind = (value: string): void => {
    const kind = toCalendarKind(value);

    form.setValue('kind', kind);
    form.setValue(
      'visibility',
      toDefaultVisibility(ownerGroupIdOf(form.getValues('ownerId')), kind),
    );
  };

  return {
    form,
    values,
    setDescription: (value) => {
      form.setValue('description', value, { shouldValidate: true });
    },
    setOwner,
    setVenue: (value) => {
      form.setValue('venueId', value);
    },
    setKind,
    setVisibility: (value) => {
      form.setValue('visibility', toCalendarVisibility(value));
    },
    setStartDay,
    setStartTime,
    setEndDay: (value) => {
      form.setValue('endDay', value ?? '', { shouldValidate: true });
    },
    setEndTime: (value) => {
      form.setValue('endTime', value, { shouldValidate: true });
    },
    setAsksForResponse: (value) => {
      form.setValue('asksForResponse', value);
    },
    isEditing: entry !== null,
    isSaving: createMutation.isPending || updateMutation.isPending,
    rejection,
    collisionWarning,
    submit: () => {
      void handleSubmit();
    },
  };
};
