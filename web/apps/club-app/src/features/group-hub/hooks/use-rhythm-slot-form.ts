import { useState } from 'react';
import type { Weekday } from '@/features/groups';
import { toSlotFormValues } from '../rhythm-labels';
import type { TrainingSlot, TrainingSlotForm } from '../schemas';
import { TrainingSlotFormSchema } from '../schemas';

interface RhythmSlotFormInput {
  open: boolean;
  slot: TrainingSlot | null;
  onSubmit: (form: TrainingSlotForm) => void;
}

export interface RhythmSlotFormControl {
  weekday: Weekday;
  setWeekday: (value: string) => void;
  startsAt: string;
  setStartsAt: (value: string) => void;
  durationMinutes: string;
  setDurationMinutes: (value: string) => void;
  venueId: string;
  setVenueId: (value: string) => void;
  canSubmit: boolean;
  submit: () => void;
}

const toWeekday = (value: string, fallback: Weekday): Weekday => {
  const parsed = TrainingSlotFormSchema.shape.weekday.safeParse(value);

  return parsed.success ? parsed.data : fallback;
};

export const useRhythmSlotForm = ({
  open,
  slot,
  onSubmit,
}: RhythmSlotFormInput): RhythmSlotFormControl => {
  const initial = toSlotFormValues(slot);

  const [wasOpen, setWasOpen] = useState(open);
  const [weekday, setWeekdayValue] = useState<Weekday>(initial.weekday);
  const [startsAt, setStartsAt] = useState(initial.startsAt);
  const [durationMinutes, setDurationMinutes] = useState(String(initial.durationMinutes));
  const [venueId, setVenueId] = useState(initial.venueId);

  if (wasOpen !== open) {
    setWasOpen(open);

    if (open) {
      setWeekdayValue(initial.weekday);
      setStartsAt(initial.startsAt);
      setDurationMinutes(String(initial.durationMinutes));
      setVenueId(initial.venueId);
    }
  }

  const draft = TrainingSlotFormSchema.safeParse({
    weekday,
    startsAt,
    durationMinutes: Number(durationMinutes),
    venueId,
  });

  const setWeekday = (value: string): void => {
    setWeekdayValue(toWeekday(value, weekday));
  };

  const submit = (): void => {
    if (!draft.success) {
      return;
    }

    onSubmit(draft.data);
  };

  return {
    weekday,
    setWeekday,
    startsAt,
    setStartsAt,
    durationMinutes,
    setDurationMinutes,
    venueId,
    setVenueId,
    canSubmit: draft.success,
    submit,
  };
};
