import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import type { Weekday } from '@/features/groups';
import { toLandingKey } from '@/features/write';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useSetTrainingSlotsMutation } from '../api';
import { toSlotFormValues, toSlotPayload, toSlotPayloadOf } from '../rhythm-labels';
import type { TrainingSlot } from '../schemas';
import { TrainingSlotFormSchema } from '../schemas';

interface GroupSlotEditorInput {
  groupId: number;
  slot: TrainingSlot | null;
  slots: readonly TrainingSlot[];
}

export interface GroupSlotEditorControl {
  weekday: Weekday;
  setWeekday: (value: string) => void;
  startsAt: string;
  setStartsAt: (value: string) => void;
  durationMinutes: string;
  setDurationMinutes: (value: string) => void;
  venueId: string;
  setVenueId: (value: string) => void;
  isDirty: boolean;
  isSaving: boolean;
  rejection: string | null;
  actionLabel: string;
  submit: () => void;
  remove: () => void;
}

const ADD_LABEL = 'Hinzufügen';
const SAVE_LABEL = 'Speichern';

const toWeekday = (value: string, fallback: Weekday): Weekday => {
  const parsed = TrainingSlotFormSchema.shape.weekday.safeParse(value);

  return parsed.success ? parsed.data : fallback;
};

export const useGroupSlotEditor = ({
  groupId,
  slot,
  slots,
}: GroupSlotEditorInput): GroupSlotEditorControl => {
  const initial = toSlotFormValues(slot);
  const [weekday, setWeekdayValue] = useState<Weekday>(initial.weekday);
  const [startsAt, setStartsAt] = useState(initial.startsAt);
  const [durationMinutes, setDurationMinutes] = useState(String(initial.durationMinutes));
  const [venueId, setVenueId] = useState(initial.venueId);
  const [rejection, setRejection] = useState<string | null>(null);
  const mutation = useSetTrainingSlotsMutation(groupId);
  const navigate = useNavigate();

  const setWeekday = (value: string): void => {
    setWeekdayValue(toWeekday(value, weekday));
  };

  const isDirty =
    weekday !== initial.weekday ||
    startsAt !== initial.startsAt ||
    durationMinutes !== String(initial.durationMinutes) ||
    venueId !== initial.venueId;

  const leave = (): void => {
    void navigate({ to: '/groups/$groupId', params: { groupId: String(groupId) }, replace: true });
  };

  const landOnEdited = (slotId: number): void => {
    void navigate({
      to: '/groups/$groupId',
      params: { groupId: String(groupId) },
      search: (previous) => ({ ...previous, changed: toLandingKey('training-slot', slotId) }),
      replace: true,
    });
  };

  const submit = (): void => {
    const draft = TrainingSlotFormSchema.safeParse({
      weekday,
      startsAt,
      durationMinutes: Number(durationMinutes),
      venueId,
    });

    if (!draft.success) {
      return;
    }

    setRejection(null);
    const payload = toSlotPayload(draft.data);
    const next =
      slot === null
        ? [...slots.map(toSlotPayloadOf), payload]
        : slots.map((existing) =>
            existing.groupTrainingSlotId === slot.groupTrainingSlotId
              ? payload
              : toSlotPayloadOf(existing),
          );

    mutation.mutate(next, {
      onSuccess: () => {
        if (slot === null) {
          leave();
        } else {
          landOnEdited(slot.groupTrainingSlotId);
        }
      },
      onError: (error) => {
        setRejection(toWriteErrorMessage(error));
      },
    });
  };

  const remove = (): void => {
    if (slot === null) {
      return;
    }

    setRejection(null);
    const next = slots
      .filter((existing) => existing.groupTrainingSlotId !== slot.groupTrainingSlotId)
      .map(toSlotPayloadOf);

    mutation.mutate(next, {
      onSuccess: leave,
      onError: (error) => {
        setRejection(toWriteErrorMessage(error));
      },
    });
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
    isDirty,
    isSaving: mutation.isPending,
    rejection,
    actionLabel: slot === null ? ADD_LABEL : SAVE_LABEL,
    submit,
    remove,
  };
};
