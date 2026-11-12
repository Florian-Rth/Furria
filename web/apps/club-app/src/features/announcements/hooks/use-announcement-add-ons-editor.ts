import type { UseFormReturn } from 'react-hook-form';
import { useFormState } from 'react-hook-form';
import type { AddOnCardsEditor } from '@/features/calendar/add-on-cards-editor';
import { nextFreshKey, toDetachedCards } from '@/features/calendar/calendar-add-ons';
import { toDeadlinePaths } from '@/features/calendar/calendar-deadlines';
import type { CalendarFieldError } from '@/features/calendar/calendar-field-error';
import { toFieldError } from '@/features/calendar/calendar-field-error';
import type { CalendarAddOnKind } from '@/features/calendar/schemas';
import {
  ANNOUNCEMENT_DEADLINE_FALLBACK_TIME,
  toAnnouncementAddOnKind,
  toAnswersUntilPath,
  toAnswersUntilPaths,
  toAttachedAnnouncementCards,
  toChangedAnnouncementPollCards,
  toChangedAnnouncementSignUpListCards,
  toChangedAttendanceCards,
  withAnswersUntilDay,
} from '../announcement-add-ons';
import type { AnnouncementAddOnCardForm, AnnouncementForm } from '../schemas';

const QUIET_EDIT = { shouldDirty: true } as const;

export interface AnnouncementAddOnsEditor extends AddOnCardsEditor {
  attachAddOn: (kind: CalendarAddOnKind) => void;
  detachAddOn: (key: string) => void;
  answersUntilErrorAt: (index: number) => CalendarFieldError;
  setAnswersUntilDay: (index: number, day: string | null) => void;
  setAnswersUntilTime: (index: number, time: string) => void;
  recheckDeadlines: () => void;
}

export const useAnnouncementAddOnsEditor = (
  form: UseFormReturn<AnnouncementForm>,
): AnnouncementAddOnsEditor => {
  const addOnsState = useFormState({ control: form.control, name: 'addOns' });
  const cards = (): AnnouncementAddOnCardForm[] => form.getValues('addOns');
  const place = (next: AnnouncementAddOnCardForm[]): void => {
    form.setValue('addOns', next, QUIET_EDIT);
  };
  const recheck = (path: Parameters<typeof form.trigger>[0]): void => {
    void form.trigger(path);
  };

  const changeAttendance = (
    index: number,
    change: Parameters<typeof toChangedAttendanceCards>[1],
  ): void => {
    place(toChangedAttendanceCards(cards(), change));
    recheck(toAnswersUntilPath(index));
  };

  return {
    addOnErrorAt: (path) => toFieldError(form.getFieldState(path, addOnsState).error?.message),
    answersUntilErrorAt: (index) =>
      toFieldError(form.getFieldState(toAnswersUntilPath(index), addOnsState).error?.message),
    deadlineFallbackTime: () => ANNOUNCEMENT_DEADLINE_FALLBACK_TIME,
    attachAddOn: (kind) => {
      const announcementKind = toAnnouncementAddOnKind(kind);

      if (announcementKind === null) {
        return;
      }

      place(toAttachedAnnouncementCards(cards(), announcementKind, nextFreshKey));
    },
    detachAddOn: (key) => {
      form.clearErrors('addOns');
      place(toDetachedCards(cards(), key));
    },
    updatePoll: (key, change) => {
      place(toChangedAnnouncementPollCards(cards(), key, change));
    },
    recheckPollField: recheck,
    forgetPollErrors: (path) => {
      form.clearErrors(path);
    },
    updateSignUpList: (key, change) => {
      place(toChangedAnnouncementSignUpListCards(cards(), key, change));
    },
    recheckSignUpListField: recheck,
    setAnswersUntilDay: (index, day) => {
      changeAttendance(index, (attendance) => withAnswersUntilDay(attendance, day));
    },
    setAnswersUntilTime: (index, time) => {
      changeAttendance(index, (attendance) => ({ ...attendance, answersUntilTime: time }));
    },
    recheckDeadlines: () => {
      const paths = [...toDeadlinePaths(cards()), ...toAnswersUntilPaths(cards())];

      if (paths.length > 0) {
        recheck(paths);
      }
    },
  };
};
