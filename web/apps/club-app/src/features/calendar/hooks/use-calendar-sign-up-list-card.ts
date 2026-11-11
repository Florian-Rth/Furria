import { useFormState } from 'react-hook-form';
import { hasNoDeadline } from '../calendar-deadlines';
import type { CalendarFieldError } from '../calendar-field-error';
import { toFieldError } from '../calendar-field-error';
import { toSignUpListCardMetaLabel, toSignUpListRemoveLabel } from '../calendar-labels';
import type { SignUpListFieldPath } from '../calendar-sign-up-lists';
import { toHeldSignUpList, withSignUpUntilDay } from '../calendar-sign-up-lists';
import type { CalendarEntry, CalendarSignUpListForm } from '../schemas';
import type { CalendarEntryEditorControl } from './use-calendar-entry-editor';

export interface CalendarSignUpListFieldNames {
  title: string;
  hint: string;
  signUpUntilDay: string;
  signUpUntilTime: string;
}

export interface CalendarSignUpListCardControl {
  fieldNames: CalendarSignUpListFieldNames;
  removeLabel: string;
  metaLabel: string | undefined;
  isFrozen: boolean;
  titleError: CalendarFieldError;
  hintError: CalendarFieldError;
  deadlineError: CalendarFieldError;
  isDeadlineTimeLocked: boolean;
  setTitle: (title: string) => void;
  setHint: (hint: string) => void;
  setSignUpUntilDay: (day: string | null) => void;
  setSignUpUntilTime: (time: string) => void;
}

interface CalendarSignUpListCardInput {
  control: CalendarEntryEditorControl;
  cardKey: string;
  index: number;
  list: CalendarSignUpListForm;
  entry: CalendarEntry | null;
}

export const useCalendarSignUpListCard = ({
  control,
  cardKey,
  index,
  list,
  entry,
}: CalendarSignUpListCardInput): CalendarSignUpListCardControl => {
  const titlePath = `addOns.${index}.signUpList.title` as const;
  const hintPath = `addOns.${index}.signUpList.hint` as const;
  const deadlinePath = `addOns.${index}.signUpList.signUpUntilTime` as const;
  const formState = useFormState({ control: control.form.control, name: `addOns.${index}` });
  const errorAt = (path: SignUpListFieldPath): CalendarFieldError =>
    toFieldError(control.form.getFieldState(path, formState).error?.message);
  const held = toHeldSignUpList(entry?.addOns ?? null, list.signUpListId);
  const isFrozen = held?.isClosed === true;

  const change = (edit: (current: CalendarSignUpListForm) => CalendarSignUpListForm): void => {
    control.updateSignUpList(cardKey, edit);
  };

  return {
    fieldNames: {
      title: titlePath,
      hint: hintPath,
      signUpUntilDay: `addOns.${index}.signUpList.signUpUntilDay`,
      signUpUntilTime: deadlinePath,
    },
    removeLabel: toSignUpListRemoveLabel(list.title),
    metaLabel: toSignUpListCardMetaLabel(held),
    isFrozen,
    titleError: errorAt(titlePath),
    hintError: errorAt(hintPath),
    deadlineError: errorAt(deadlinePath),
    isDeadlineTimeLocked: isFrozen || hasNoDeadline(list.signUpUntilDay),
    setTitle: (title) => {
      change((current) => ({ ...current, title }));
      control.recheckSignUpListField(titlePath);
    },
    setHint: (hint) => {
      change((current) => ({ ...current, hint }));
      control.recheckSignUpListField(hintPath);
    },
    setSignUpUntilDay: (day) => {
      const fallbackTime = control.form.getValues('startTime');

      change((current) => withSignUpUntilDay(current, day, fallbackTime));
      control.recheckSignUpListField(deadlinePath);
    },
    setSignUpUntilTime: (time) => {
      change((current) => ({ ...current, signUpUntilTime: time }));
      control.recheckSignUpListField(deadlinePath);
    },
  };
};
