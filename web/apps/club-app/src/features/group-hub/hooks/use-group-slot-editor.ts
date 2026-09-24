import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useController, useForm } from 'react-hook-form';
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
  canSubmit: boolean;
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
  const [rejection, setRejection] = useState<string | null>(null);
  const mutation = useSetTrainingSlotsMutation(groupId);
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(TrainingSlotFormSchema),
    defaultValues: toSlotFormValues(slot),
    mode: 'onTouched',
  });
  const { isDirty, isValid } = form.formState;
  const weekday = useController({ control: form.control, name: 'weekday' });
  const startsAt = useController({ control: form.control, name: 'startsAt' });
  const durationMinutes = useController({ control: form.control, name: 'durationMinutes' });
  const venueId = useController({ control: form.control, name: 'venueId' });

  const setWeekday = (value: string): void => {
    weekday.field.onChange(toWeekday(value, weekday.field.value));
  };

  const setDurationMinutes = (value: string): void => {
    durationMinutes.field.onChange(Number(value));
  };

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

  const handleFormSubmit = form.handleSubmit((values) => {
    setRejection(null);
    const payload = toSlotPayload(values);
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
  });

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
    weekday: weekday.field.value,
    setWeekday,
    startsAt: startsAt.field.value,
    setStartsAt: startsAt.field.onChange,
    durationMinutes: String(durationMinutes.field.value),
    setDurationMinutes,
    venueId: venueId.field.value,
    setVenueId: venueId.field.onChange,
    isDirty,
    canSubmit: isValid,
    isSaving: mutation.isPending,
    rejection,
    actionLabel: slot === null ? ADD_LABEL : SAVE_LABEL,
    submit: () => {
      void handleFormSubmit();
    },
    remove,
  };
};
