import { useController } from 'react-hook-form';
import type { Weekday } from '@/features/groups';
import type { WriteLanding } from '@/features/write';
import { useWriteForm } from '@/features/write';
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
  const mutation = useSetTrainingSlotsMutation(groupId);
  const groupLanding: WriteLanding = { to: '/groups/$groupId', params: { groupId } };

  const write = useWriteForm({
    schema: TrainingSlotFormSchema,
    defaults: toSlotFormValues(slot),
    mutate: (values) => {
      const payload = toSlotPayload(values);

      return mutation.mutateAsync(
        slot === null
          ? [...slots.map(toSlotPayloadOf), payload]
          : slots.map((existing) =>
              existing.groupTrainingSlotId === slot.groupTrainingSlotId
                ? payload
                : toSlotPayloadOf(existing),
            ),
      );
    },
    landing: () =>
      slot === null
        ? groupLanding
        : { ...groupLanding, mark: { kind: 'training-slot', id: slot.groupTrainingSlotId } },
  });
  const weekday = useController({ control: write.form.control, name: 'weekday' });
  const startsAt = useController({ control: write.form.control, name: 'startsAt' });
  const durationMinutes = useController({ control: write.form.control, name: 'durationMinutes' });
  const venueId = useController({ control: write.form.control, name: 'venueId' });

  const remove = (): void => {
    if (slot === null) {
      return;
    }

    write.run(
      () =>
        mutation.mutateAsync(
          slots
            .filter((existing) => existing.groupTrainingSlotId !== slot.groupTrainingSlotId)
            .map(toSlotPayloadOf),
        ),
      () => groupLanding,
    );
  };

  return {
    weekday: weekday.field.value,
    setWeekday: (value) => {
      weekday.field.onChange(toWeekday(value, weekday.field.value));
    },
    startsAt: startsAt.field.value,
    setStartsAt: startsAt.field.onChange,
    durationMinutes: String(durationMinutes.field.value),
    setDurationMinutes: (value) => {
      durationMinutes.field.onChange(Number(value));
    },
    venueId: venueId.field.value,
    setVenueId: venueId.field.onChange,
    isDirty: write.isDirty,
    canSubmit: write.canSubmit,
    isSaving: write.isSaving,
    rejection: write.rejection,
    actionLabel: slot === null ? ADD_LABEL : SAVE_LABEL,
    submit: write.submit,
    remove,
  };
};
