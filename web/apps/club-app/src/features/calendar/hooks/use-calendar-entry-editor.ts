import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { toLandingKey } from '@/features/write';
import { toFormFailures } from '@/lib/api/api-failures';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useCreateCalendarEntryMutation, useUpdateCalendarEntryMutation } from '../api';
import type { CalendarDayTime, CalendarOwnerOption } from '../calendar-authoring';
import {
  toCalendarKind,
  toCalendarVisibility,
  toDefaultVisibility,
  toEndKeptInStep,
  toEntryFormValues,
  toEntryPayload,
  toParticipationKeptForOwner,
  toToggledParticipation,
} from '../calendar-authoring';
import type { CalendarEntry, CalendarEntryForm } from '../schemas';
import { CalendarEntryFormSchema } from '../schemas';

const FIELD_NAMES = ['title', 'description'] as const;
const LANDING_KIND = 'calendar-entry';

interface CalendarEntryEditorInput {
  entry: CalendarEntry | null;
  ownerOptions: readonly CalendarOwnerOption[];
}

export interface CalendarEntryEditorControl {
  form: UseFormReturn<CalendarEntryForm>;
  values: CalendarEntryForm;
  setDescription: (value: string) => void;
  setOwner: (value: string) => void;
  setVenue: (value: string) => void;
  toggleParticipatingGroup: (value: string) => void;
  setKind: (value: string) => void;
  setVisibility: (value: string) => void;
  setStartDay: (value: string | null) => void;
  setStartTime: (value: string) => void;
  setEndDay: (value: string | null) => void;
  setEndTime: (value: string) => void;
  setAsksForResponse: (value: boolean) => void;
  isEditing: boolean;
  isDirty: boolean;
  isSaving: boolean;
  rejection: string | null;
  submit: () => void;
}

export const useCalendarEntryEditor = ({
  entry,
  ownerOptions,
}: CalendarEntryEditorInput): CalendarEntryEditorControl => {
  const [today] = useState(() => new Date());
  const [rejection, setRejection] = useState<string | null>(null);
  const createMutation = useCreateCalendarEntryMutation();
  const updateMutation = useUpdateCalendarEntryMutation();
  const navigate = useNavigate();

  const form = useForm<CalendarEntryForm>({
    resolver: zodResolver(CalendarEntryFormSchema),
    defaultValues: toEntryFormValues(entry, ownerOptions, today),
  });

  const values = form.watch();

  const landOn = (calendarEntryId: number): void => {
    void navigate({
      to: '/calendar',
      search: (previous) => ({
        ...previous,
        changed: toLandingKey(LANDING_KIND, calendarEntryId),
      }),
      replace: true,
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
    const payload = toEntryPayload(submitted);

    if (entry === null) {
      createMutation.mutate(
        { payload },
        { onSuccess: (written) => landOn(written.calendarEntryId), onError: showFailure },
      );
      return;
    }

    updateMutation.mutate(
      { calendarEntryId: entry.calendarEntryId, payload },
      { onSuccess: (written) => landOn(written.calendarEntryId), onError: showFailure },
    );
  });

  const ownerGroupIdOf = (ownerId: string): number | null =>
    ownerOptions.find((option) => option.id === ownerId)?.ownerGroupId ?? null;

  const setOwner = (value: string): void => {
    form.setValue('ownerId', value);
    form.setValue('visibility', toDefaultVisibility(ownerGroupIdOf(value), form.getValues('kind')));
    form.setValue(
      'participatingGroupIds',
      toParticipationKeptForOwner(form.getValues('participatingGroupIds'), value),
      { shouldValidate: true },
    );
  };

  const toggleParticipatingGroup = (value: string): void => {
    form.setValue(
      'participatingGroupIds',
      toToggledParticipation(form.getValues('participatingGroupIds'), value),
      { shouldValidate: true },
    );
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
    toggleParticipatingGroup,
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
    isDirty: form.formState.isDirty,
    isSaving: createMutation.isPending || updateMutation.isPending,
    rejection,
    submit: () => {
      void handleSubmit();
    },
  };
};
