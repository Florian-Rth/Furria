import { useSearch } from '@tanstack/react-router';
import { useRef, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useWriteForm } from '@/features/write';
import { toIsoDay } from '@/lib/day';
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

const LANDING_KIND = 'calendar-entry';
const FIELD_EDIT = { shouldDirty: true, shouldValidate: true } as const;

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
  canSubmit: boolean;
  isSaving: boolean;
  rejection: string | null;
  submit: () => void;
}

export const useCalendarEntryEditor = ({
  entry,
  ownerOptions,
}: CalendarEntryEditorInput): CalendarEntryEditorControl => {
  const [today] = useState(() => new Date());
  const { day } = useSearch({ strict: false });
  const createMutation = useCreateCalendarEntryMutation();
  const updateMutation = useUpdateCalendarEntryMutation();
  const landedDay = useRef(day ?? toIsoDay(today));

  const write = useWriteForm({
    schema: CalendarEntryFormSchema,
    defaults: toEntryFormValues(entry, ownerOptions, day ?? toIsoDay(today)),
    mutate: (submitted) => {
      const payload = toEntryPayload(submitted);

      landedDay.current = submitted.startDay;

      return entry === null
        ? createMutation.mutateAsync({ payload })
        : updateMutation.mutateAsync({ calendarEntryId: entry.calendarEntryId, payload });
    },
    landing: ({ calendarEntryId }) => ({
      to: '/calendar',
      search: { day: landedDay.current },
      mark: { kind: LANDING_KIND, id: calendarEntryId },
    }),
  });
  const { form, values } = write;

  const ownerGroupIdOf = (ownerId: string): number | null =>
    ownerOptions.find((option) => option.id === ownerId)?.ownerGroupId ?? null;

  const setOwner = (value: string): void => {
    form.setValue('ownerId', value, FIELD_EDIT);
    form.setValue(
      'visibility',
      toDefaultVisibility(ownerGroupIdOf(value), form.getValues('kind')),
      FIELD_EDIT,
    );
    form.setValue(
      'participatingGroupIds',
      toParticipationKeptForOwner(form.getValues('participatingGroupIds'), value),
      FIELD_EDIT,
    );
  };

  const toggleParticipatingGroup = (value: string): void => {
    form.setValue(
      'participatingGroupIds',
      toToggledParticipation(form.getValues('participatingGroupIds'), value),
      FIELD_EDIT,
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

    form.setValue('endDay', kept.day, FIELD_EDIT);
    form.setValue('endTime', kept.time, FIELD_EDIT);
  };

  const setStartDay = (value: string | null): void => {
    const day = value ?? '';

    keepEndInStep({ day, time: form.getValues('startTime') });
    form.setValue('startDay', day, FIELD_EDIT);
  };

  const setStartTime = (value: string): void => {
    keepEndInStep({ day: form.getValues('startDay'), time: value });
    form.setValue('startTime', value, FIELD_EDIT);
  };

  const setKind = (value: string): void => {
    const kind = toCalendarKind(value);

    form.setValue('kind', kind, FIELD_EDIT);
    form.setValue(
      'visibility',
      toDefaultVisibility(ownerGroupIdOf(form.getValues('ownerId')), kind),
      FIELD_EDIT,
    );
  };

  return {
    form,
    values,
    setDescription: (value) => {
      form.setValue('description', value, FIELD_EDIT);
    },
    setOwner,
    setVenue: (value) => {
      form.setValue('venueId', value, FIELD_EDIT);
    },
    toggleParticipatingGroup,
    setKind,
    setVisibility: (value) => {
      form.setValue('visibility', toCalendarVisibility(value), FIELD_EDIT);
    },
    setStartDay,
    setStartTime,
    setEndDay: (value) => {
      form.setValue('endDay', value ?? '', FIELD_EDIT);
    },
    setEndTime: (value) => {
      form.setValue('endTime', value, FIELD_EDIT);
    },
    setAsksForResponse: (value) => {
      form.setValue('asksForResponse', value, FIELD_EDIT);
    },
    isEditing: entry !== null,
    isDirty: write.isDirty,
    canSubmit: write.canSubmit,
    isSaving: write.isSaving,
    rejection: write.rejection,
    submit: write.submit,
  };
};
