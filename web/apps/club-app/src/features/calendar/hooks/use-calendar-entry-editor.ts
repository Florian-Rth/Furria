import { useSearch } from '@tanstack/react-router';
import { useRef, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useFormState } from 'react-hook-form';
import { useWriteForm } from '@/features/write/hooks/use-write-form';
import type { DayTime } from '@/lib/day';
import { toIsoDay } from '@/lib/day';
import type { AddOnCardsEditor } from '../add-on-cards-editor';
import { useCreateCalendarEntryMutation, useUpdateCalendarEntryMutation } from '../api';
import {
  nextFreshKey,
  toAttachedCards,
  toChangedDayScheduleCards,
  toChangedPollCards,
  toChangedSignUpListCards,
  toDetachedCards,
} from '../calendar-add-ons';
import {
  toAddedEnd,
  toAudienceSwitch,
  toCalendarAudience,
  toCalendarKind,
  toEndKeptInStep,
  toEntryDraft,
  toEntryFormValues,
  toEntryLanding,
  toEntryPayload,
  toParticipationKeptForOwner,
  toToggledValue,
} from '../calendar-authoring';
import type { DayScheduleFieldPath } from '../calendar-day-schedules';
import { toStepDayPaths } from '../calendar-day-schedules';
import { toDeadlinePaths } from '../calendar-deadlines';
import { toFieldError } from '../calendar-field-error';
import type { CalendarAudienceChoice, CalendarOwnerOption } from '../calendar-owner';
import { toChoiceForKind, toDerivedOwnerId, toHeldOwnership } from '../calendar-owner';
import type { NotifySwitch } from '../notify-reach';
import type {
  CalendarAddOnKind,
  CalendarDayScheduleForm,
  CalendarEntry,
  CalendarEntryForm,
  CalendarPollForm,
  CalendarSignUpListForm,
} from '../schemas';
import { CalendarEntryFormSchema } from '../schemas';

const FIELD_EDIT = { shouldDirty: true, shouldValidate: true } as const;
const QUIET_EDIT = { shouldDirty: true } as const;
const NO_END: DayTime = { day: '', time: '' };

interface CalendarEntryEditorInput {
  entry: CalendarEntry | null;
  ownerOptions: readonly CalendarOwnerOption[];
}

export interface CalendarEntryEditorControl extends AddOnCardsEditor {
  form: UseFormReturn<CalendarEntryForm>;
  values: CalendarEntryForm;
  setDescription: (value: string) => void;
  setVenue: (value: string) => void;
  toggleParticipatingGroup: (value: string) => void;
  setKind: (value: string) => void;
  setAudience: (value: string) => void;
  toggleAudienceGroup: (value: string) => void;
  setAudiencePeople: (personIds: string[]) => void;
  attachAddOn: (kind: CalendarAddOnKind) => void;
  detachAddOn: (key: string) => void;
  updateDaySchedule: (
    key: string,
    change: (schedule: CalendarDayScheduleForm) => CalendarDayScheduleForm,
  ) => void;
  recheckDayScheduleField: (path: DayScheduleFieldPath) => void;
  setStartDay: (value: string) => void;
  setStartTime: (value: string) => void;
  addEnd: () => void;
  removeEnd: () => void;
  setEndDay: (value: string) => void;
  setEndTime: (value: string) => void;
  notify: NotifySwitch | null;
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
  const search = useSearch({ strict: false });
  const { day } = search;
  const draft = toEntryDraft(search);
  const createMutation = useCreateCalendarEntryMutation();
  const updateMutation = useUpdateCalendarEntryMutation();
  const landedDay = useRef(day ?? toIsoDay(today));

  const write = useWriteForm({
    schema: CalendarEntryFormSchema,
    defaults: toEntryFormValues(entry, ownerOptions, day ?? toIsoDay(today), draft),
    mutate: (submitted) => {
      const payload = toEntryPayload(submitted);

      landedDay.current = submitted.startDay;

      return entry === null
        ? createMutation.mutateAsync({ payload })
        : updateMutation.mutateAsync({ calendarEntryId: entry.calendarEntryId, payload });
    },
    landing: ({ calendarEntryId }) => toEntryLanding(calendarEntryId, landedDay.current, draft),
  });
  const { form, values } = write;
  const heldOwnership = toHeldOwnership(entry);
  const addOnsState = useFormState({ control: form.control, name: 'addOns' });

  const deriveOwner = (): void => {
    const current = form.getValues();
    const ownerId = toDerivedOwnerId(current, current.ownerId, ownerOptions, heldOwnership);

    if (ownerId === current.ownerId) {
      return;
    }

    form.setValue('ownerId', ownerId, FIELD_EDIT);
    form.setValue(
      'participatingGroupIds',
      toParticipationKeptForOwner(current.participatingGroupIds, ownerId),
      FIELD_EDIT,
    );
  };

  const placeAudience = (choice: CalendarAudienceChoice): void => {
    form.setValue('audience', choice.audience, FIELD_EDIT);
    form.setValue('audienceGroupIds', choice.audienceGroupIds, FIELD_EDIT);
    form.setValue('audiencePersonIds', choice.audiencePersonIds, FIELD_EDIT);
    deriveOwner();
  };

  const toggleParticipatingGroup = (value: string): void => {
    form.setValue(
      'participatingGroupIds',
      toToggledValue(form.getValues('participatingGroupIds'), value),
      FIELD_EDIT,
    );
  };

  const keepEndInStep = (nextStart: DayTime): void => {
    const endDay = form.getValues('endDay');

    if (endDay === '') {
      return;
    }

    const previousStart: DayTime = {
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

  const recheckDeadlines = (): void => {
    const paths = toDeadlinePaths(form.getValues('addOns'));

    if (paths.length > 0) {
      void form.trigger(paths);
    }
  };

  const setStartDay = (value: string): void => {
    keepEndInStep({ day: value, time: form.getValues('startTime') });
    form.setValue('startDay', value, FIELD_EDIT);
    recheckDeadlines();
  };

  const setStartTime = (value: string): void => {
    keepEndInStep({ day: form.getValues('startDay'), time: value });
    form.setValue('startTime', value, FIELD_EDIT);
    recheckDeadlines();
  };

  const placeEnd = (end: DayTime): void => {
    form.setValue('endDay', end.day, FIELD_EDIT);
    form.setValue('endTime', end.time, FIELD_EDIT);
    recheckStepDays();
  };

  const addEnd = (): void => {
    placeEnd(toAddedEnd({ day: form.getValues('startDay'), time: form.getValues('startTime') }));
  };

  const removeEnd = (): void => {
    placeEnd(NO_END);
  };

  const setKind = (value: string): void => {
    const kind = toCalendarKind(value);
    const current = form.getValues();

    form.setValue('kind', kind, FIELD_EDIT);
    placeAudience(toChoiceForKind(current, kind, current.ownerId));
  };

  const setAudience = (value: string): void => {
    const audience = toCalendarAudience(value);

    if (audience === null) {
      return;
    }

    const current = form.getValues();

    placeAudience({ ...current, ...toAudienceSwitch(current, audience) });
  };

  const toggleAudienceGroup = (value: string): void => {
    const current = form.getValues();

    placeAudience({
      ...current,
      audienceGroupIds: toToggledValue(current.audienceGroupIds, value),
    });
  };

  const attachAddOn = (kind: CalendarAddOnKind): void => {
    form.setValue(
      'addOns',
      toAttachedCards(form.getValues('addOns'), kind, nextFreshKey, form.getValues('startTime')),
      QUIET_EDIT,
    );
  };

  const detachAddOn = (key: string): void => {
    const cards = form.getValues('addOns');
    const detached = toDetachedCards(cards, key);

    form.clearErrors('addOns');
    form.setValue('addOns', detached, QUIET_EDIT);

    if (!detached.some((card) => card.kind === 'participatingGroups')) {
      form.setValue('participatingGroupIds', [], FIELD_EDIT);
    }
  };

  const updatePoll = (key: string, change: (poll: CalendarPollForm) => CalendarPollForm): void => {
    form.setValue('addOns', toChangedPollCards(form.getValues('addOns'), key, change), QUIET_EDIT);
  };

  const updateSignUpList = (
    key: string,
    change: (list: CalendarSignUpListForm) => CalendarSignUpListForm,
  ): void => {
    form.setValue(
      'addOns',
      toChangedSignUpListCards(form.getValues('addOns'), key, change),
      QUIET_EDIT,
    );
  };

  const updateDaySchedule = (
    key: string,
    change: (schedule: CalendarDayScheduleForm) => CalendarDayScheduleForm,
  ): void => {
    form.setValue(
      'addOns',
      toChangedDayScheduleCards(form.getValues('addOns'), key, change),
      QUIET_EDIT,
    );
  };

  const recheckStepDays = (): void => {
    const paths = toStepDayPaths(form.getValues('addOns'));

    if (paths.length > 0) {
      void form.trigger(paths);
    }
  };

  const setNotify = (checked: boolean): void => {
    form.setValue('notify', checked, FIELD_EDIT);
  };

  return {
    form,
    values,
    addOnErrorAt: (path) => toFieldError(form.getFieldState(path, addOnsState).error?.message),
    deadlineFallbackTime: () => form.getValues('startTime'),
    setDescription: (value) => {
      form.setValue('description', value, FIELD_EDIT);
    },
    setVenue: (value) => {
      form.setValue('venueId', value, FIELD_EDIT);
    },
    toggleParticipatingGroup,
    setKind,
    setAudience,
    toggleAudienceGroup,
    setAudiencePeople: (personIds) => {
      placeAudience({ ...form.getValues(), audiencePersonIds: personIds });
    },
    attachAddOn,
    detachAddOn,
    updatePoll,
    recheckPollField: (path) => {
      void form.trigger(path);
    },
    forgetPollErrors: (path) => {
      form.clearErrors(path);
    },
    updateSignUpList,
    recheckSignUpListField: (path) => {
      void form.trigger(path);
    },
    updateDaySchedule,
    recheckDayScheduleField: (path) => {
      void form.trigger(path);
    },
    setStartDay,
    setStartTime,
    addEnd,
    removeEnd,
    setEndDay: (value) => {
      form.setValue('endDay', value, FIELD_EDIT);
      recheckStepDays();
    },
    setEndTime: (value) => {
      form.setValue('endTime', value, FIELD_EDIT);
    },
    notify: entry === null ? { checked: values.notify, set: setNotify } : null,
    isEditing: entry !== null,
    isDirty: write.isDirty,
    canSubmit: write.canSubmit,
    isSaving: write.isSaving,
    rejection: write.rejection,
    submit: write.submit,
  };
};
