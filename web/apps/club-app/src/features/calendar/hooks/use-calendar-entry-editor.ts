import { useSearch } from '@tanstack/react-router';
import { useRef, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useWriteForm } from '@/features/write/hooks/use-write-form';
import type { DayTime } from '@/lib/day';
import { toIsoDay } from '@/lib/day';
import { useCreateCalendarEntryMutation, useUpdateCalendarEntryMutation } from '../api';
import {
  nextFreshKey,
  toAttachedCards,
  toChangedPollCards,
  toChangedSignUpListCards,
  toDetachedCards,
} from '../calendar-add-ons';
import type { CalendarOwnerOption } from '../calendar-authoring';
import {
  toAudienceAfterOwnerChange,
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
import { toDeadlinePaths } from '../calendar-deadlines';
import type { PollFieldPath, PollOptionsPath } from '../calendar-polls';
import type { SignUpListFieldPath } from '../calendar-sign-up-lists';
import type {
  CalendarAddOnKind,
  CalendarEntry,
  CalendarEntryForm,
  CalendarPollForm,
  CalendarSignUpListForm,
} from '../schemas';
import { CalendarEntryFormSchema } from '../schemas';

const FIELD_EDIT = { shouldDirty: true, shouldValidate: true } as const;
const QUIET_EDIT = { shouldDirty: true } as const;

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
  setAudience: (value: string) => void;
  toggleAudienceGroup: (value: string) => void;
  setAudiencePeople: (personIds: string[]) => void;
  attachAddOn: (kind: CalendarAddOnKind) => void;
  detachAddOn: (key: string) => void;
  updatePoll: (key: string, change: (poll: CalendarPollForm) => CalendarPollForm) => void;
  recheckPollField: (path: PollFieldPath) => void;
  forgetPollErrors: (path: PollOptionsPath) => void;
  updateSignUpList: (
    key: string,
    change: (list: CalendarSignUpListForm) => CalendarSignUpListForm,
  ) => void;
  recheckSignUpListField: (path: SignUpListFieldPath) => void;
  setStartDay: (value: string | null) => void;
  setStartTime: (value: string) => void;
  setEndDay: (value: string | null) => void;
  setEndTime: (value: string) => void;
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

  const setOwner = (value: string): void => {
    const audience = toAudienceAfterOwnerChange(form.getValues(), value);

    form.setValue('ownerId', value, FIELD_EDIT);
    form.setValue('audience', audience.audience, FIELD_EDIT);
    form.setValue('audienceGroupIds', audience.audienceGroupIds, FIELD_EDIT);
    form.setValue(
      'participatingGroupIds',
      toParticipationKeptForOwner(form.getValues('participatingGroupIds'), value),
      FIELD_EDIT,
    );
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

  const setStartDay = (value: string | null): void => {
    const day = value ?? '';

    keepEndInStep({ day, time: form.getValues('startTime') });
    form.setValue('startDay', day, FIELD_EDIT);
    recheckDeadlines();
  };

  const setStartTime = (value: string): void => {
    keepEndInStep({ day: form.getValues('startDay'), time: value });
    form.setValue('startTime', value, FIELD_EDIT);
    recheckDeadlines();
  };

  const setKind = (value: string): void => {
    form.setValue('kind', toCalendarKind(value), FIELD_EDIT);
  };

  const setAudience = (value: string): void => {
    const audience = toCalendarAudience(value);

    if (audience === null) {
      return;
    }

    const choice = toAudienceSwitch(form.getValues(), audience);

    form.setValue('audience', choice.audience, FIELD_EDIT);
    form.setValue('audienceGroupIds', choice.audienceGroupIds, FIELD_EDIT);
  };

  const toggleAudienceGroup = (value: string): void => {
    form.setValue(
      'audienceGroupIds',
      toToggledValue(form.getValues('audienceGroupIds'), value),
      FIELD_EDIT,
    );
  };

  const attachAddOn = (kind: CalendarAddOnKind): void => {
    form.setValue(
      'addOns',
      toAttachedCards(form.getValues('addOns'), kind, nextFreshKey),
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
    setAudience,
    toggleAudienceGroup,
    setAudiencePeople: (personIds) => {
      form.setValue('audiencePersonIds', personIds, FIELD_EDIT);
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
    setStartDay,
    setStartTime,
    setEndDay: (value) => {
      form.setValue('endDay', value ?? '', FIELD_EDIT);
    },
    setEndTime: (value) => {
      form.setValue('endTime', value, FIELD_EDIT);
    },
    isEditing: entry !== null,
    isDirty: write.isDirty,
    canSubmit: write.canSubmit,
    isSaving: write.isSaving,
    rejection: write.rejection,
    submit: write.submit,
  };
};
