import { useState } from 'react';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useSetTrainingSlotsMutation } from '../api';
import { toSlotPayload, toSlotPayloadOf } from '../rhythm-labels';
import type { TrainingSlot, TrainingSlotForm } from '../schemas';
import { MAX_TRAINING_SLOTS } from '../schemas';

interface RhythmSlotsInput {
  groupId: number;
  slots: readonly TrainingSlot[];
}

export interface RhythmSlotsControl {
  isDialogOpen: boolean;
  edited: TrainingSlot | null;
  openAdd: () => void;
  openEdit: (groupTrainingSlotId: number) => void;
  closeDialog: () => void;
  save: (form: TrainingSlotForm) => void;
  remove: (groupTrainingSlotId: number) => void;
  canAdd: boolean;
  isSaving: boolean;
  rejection: string | null;
}

export const useRhythmSlots = ({ groupId, slots }: RhythmSlotsInput): RhythmSlotsControl => {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editedId, setEditedId] = useState<number | null>(null);
  const mutation = useSetTrainingSlotsMutation(groupId);

  const edited = slots.find((slot) => slot.groupTrainingSlotId === editedId) ?? null;

  const closeDialog = (): void => {
    setDialogOpen(false);
  };

  const openAdd = (): void => {
    setEditedId(null);
    setDialogOpen(true);
  };

  const openEdit = (groupTrainingSlotId: number): void => {
    setEditedId(groupTrainingSlotId);
    setDialogOpen(true);
  };

  const save = (form: TrainingSlotForm): void => {
    const next =
      editedId === null
        ? [...slots.map(toSlotPayloadOf), toSlotPayload(form)]
        : slots.map((slot) =>
            slot.groupTrainingSlotId === editedId ? toSlotPayload(form) : toSlotPayloadOf(slot),
          );

    mutation.mutate(next, { onSuccess: closeDialog });
  };

  const remove = (groupTrainingSlotId: number): void => {
    const next = slots
      .filter((slot) => slot.groupTrainingSlotId !== groupTrainingSlotId)
      .map(toSlotPayloadOf);

    mutation.mutate(next);
  };

  return {
    isDialogOpen,
    edited,
    openAdd,
    openEdit,
    closeDialog,
    save,
    remove,
    canAdd: slots.length < MAX_TRAINING_SLOTS,
    isSaving: mutation.isPending,
    rejection: toWriteErrorMessage(mutation.error),
  };
};
