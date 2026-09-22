import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { toLandingKey } from '@/features/write';
import type { GroupTone } from '@/lib/group-tone';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useUpdateGroupInfoMutation } from '../api';
import { toGroupInfoFormValues } from '../group-hub-labels';
import type { GroupHub } from '../schemas';
import { FOUNDED_YEAR_MESSAGE, GroupInfoFormSchema } from '../schemas';

type GroupToneChoice = GroupTone | '';

export interface GroupInfoEditorControl {
  description: string;
  setDescription: (value: string) => void;
  groupKindId: string;
  setGroupKindId: (value: string) => void;
  foundedYear: string;
  setFoundedYear: (value: string) => void;
  tone: GroupToneChoice;
  setTone: (value: GroupToneChoice) => void;
  foundedYearError: string | null;
  isDirty: boolean;
  isSaving: boolean;
  rejection: string | null;
  submit: () => void;
}

export const useGroupInfoEditor = (hub: GroupHub): GroupInfoEditorControl => {
  const initial = toGroupInfoFormValues(hub);
  const [description, setDescription] = useState(initial.description);
  const [groupKindId, setGroupKindId] = useState(initial.groupKindId);
  const [foundedYear, setFoundedYear] = useState(initial.foundedYear);
  const [tone, setTone] = useState<GroupToneChoice>(initial.tone);
  const [rejection, setRejection] = useState<string | null>(null);
  const mutation = useUpdateGroupInfoMutation(hub.groupId);
  const navigate = useNavigate();

  const yearCheck = GroupInfoFormSchema.shape.foundedYear.safeParse(foundedYear);
  const foundedYearError = yearCheck.success ? null : FOUNDED_YEAR_MESSAGE;

  const isDirty =
    description !== initial.description ||
    groupKindId !== initial.groupKindId ||
    foundedYear !== initial.foundedYear ||
    tone !== initial.tone;

  const submit = (): void => {
    if (foundedYearError !== null) {
      return;
    }

    setRejection(null);
    mutation.mutate(
      { description, isRecruiting: hub.isRecruiting, groupKindId, foundedYear, tone },
      {
        onSuccess: () => {
          void navigate({
            to: '/groups/$groupId',
            params: { groupId: String(hub.groupId) },
            search: (previous) => ({
              ...previous,
              changed: toLandingKey('group-info', hub.groupId),
            }),
            replace: true,
          });
        },
        onError: (error) => {
          setRejection(toWriteErrorMessage(error));
        },
      },
    );
  };

  return {
    description,
    setDescription,
    groupKindId,
    setGroupKindId,
    foundedYear,
    setFoundedYear,
    tone,
    setTone,
    foundedYearError,
    isDirty,
    isSaving: mutation.isPending,
    rejection,
    submit,
  };
};
