import type { KkSelectOption } from '@furria/ui/KkSelectField';
import { useFormState } from 'react-hook-form';
import { nextFreshKey } from '../calendar-add-ons';
import type { DayScheduleFieldPath } from '../calendar-day-schedules';
import {
  canAddStep,
  hasDayChoice,
  toDaySpan,
  withAddedStep,
  withChangedStep,
  withoutStep,
} from '../calendar-day-schedules';
import type { CalendarFieldError } from '../calendar-field-error';
import { toFieldError } from '../calendar-field-error';
import {
  toDayScheduleRemoveLabel,
  toScheduleDayOptions,
  toStepCountLabel,
  toStepRemoveLabel,
  toStepTextLabel,
} from '../calendar-labels';
import type { CalendarDayScheduleForm, CalendarDayScheduleStepForm } from '../schemas';
import type { CalendarEntryEditorControl } from './use-calendar-entry-editor';

export interface CalendarDayScheduleStepFieldNames {
  day: string;
  time: string;
  text: string;
}

export interface CalendarDayScheduleStepRowControl {
  key: string;
  step: CalendarDayScheduleStepForm;
  fieldNames: CalendarDayScheduleStepFieldNames;
  textLabel: string;
  removeLabel: string;
  canRemove: boolean;
  dayValue: string;
  dayOptions: readonly KkSelectOption[] | null;
  dayError: CalendarFieldError;
  timeError: CalendarFieldError;
  textError: CalendarFieldError;
  setDay: (day: string) => void;
  setTime: (time: string) => void;
  setText: (text: string) => void;
  remove: () => void;
}

export interface CalendarDayScheduleCardControl {
  titleFieldName: string;
  removeLabel: string;
  stepCountLabel: string | undefined;
  titleError: CalendarFieldError;
  rows: CalendarDayScheduleStepRowControl[];
  canAddStep: boolean;
  setTitle: (title: string) => void;
  addStep: () => void;
}

interface CalendarDayScheduleCardInput {
  control: CalendarEntryEditorControl;
  cardKey: string;
  index: number;
  schedule: CalendarDayScheduleForm;
}

export const useCalendarDayScheduleCard = ({
  control,
  cardKey,
  index,
  schedule,
}: CalendarDayScheduleCardInput): CalendarDayScheduleCardControl => {
  const schedulePath = `addOns.${index}.daySchedule` as const;
  const titlePath = `${schedulePath}.title` as const;
  const stepsPath = `${schedulePath}.steps` as const;
  const formState = useFormState({ control: control.form.control, name: `addOns.${index}` });
  const errorAt = (path: DayScheduleFieldPath): CalendarFieldError =>
    toFieldError(control.form.getFieldState(path, formState).error?.message);
  const { startDay, endDay } = control.values;
  const span = toDaySpan({ startDay, endDay });
  const dayOptions = hasDayChoice(schedule, span)
    ? toScheduleDayOptions(
        startDay,
        span,
        schedule.steps.map((step) => step.day),
      )
    : null;

  const change = (edit: (current: CalendarDayScheduleForm) => CalendarDayScheduleForm): void => {
    control.updateDaySchedule(cardKey, edit);
  };

  const toRow = (
    step: CalendarDayScheduleStepForm,
    stepIndex: number,
  ): CalendarDayScheduleStepRowControl => {
    const stepPath = `${stepsPath}.${stepIndex}` as const;
    const fieldNames = {
      day: `${stepPath}.day`,
      time: `${stepPath}.time`,
      text: `${stepPath}.text`,
    } as const;
    const editStep = (
      edit: Partial<Pick<CalendarDayScheduleStepForm, 'day' | 'time' | 'text'>>,
      path: DayScheduleFieldPath,
    ): void => {
      change((current) => withChangedStep(current, step.key, edit));
      control.recheckDayScheduleField(path);
    };

    return {
      key: step.key,
      step,
      fieldNames,
      textLabel: toStepTextLabel(stepIndex + 1),
      removeLabel: toStepRemoveLabel(stepIndex + 1),
      canRemove: schedule.steps.length > 1,
      dayValue: String(step.day),
      dayOptions,
      dayError: errorAt(fieldNames.day),
      timeError: errorAt(fieldNames.time),
      textError: errorAt(fieldNames.text),
      setDay: (day) => {
        editStep({ day: Number(day) }, fieldNames.day);
      },
      setTime: (time) => {
        editStep({ time }, fieldNames.time);
      },
      setText: (text) => {
        editStep({ text }, fieldNames.text);
      },
      remove: () => {
        change((current) => withoutStep(current, step.key));
        control.recheckDayScheduleField(stepsPath);
      },
    };
  };

  return {
    titleFieldName: titlePath,
    removeLabel: toDayScheduleRemoveLabel(schedule.title),
    stepCountLabel: toStepCountLabel(schedule.steps.length),
    titleError: errorAt(titlePath),
    rows: schedule.steps.map(toRow),
    canAddStep: canAddStep(schedule),
    setTitle: (title) => {
      change((current) => ({ ...current, title }));
      control.recheckDayScheduleField(titlePath);
    },
    addStep: () => {
      const fallbackTime = control.form.getValues('startTime');

      change((current) => withAddedStep(current, nextFreshKey(), fallbackTime));
    },
  };
};
