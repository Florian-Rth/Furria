import { useState } from 'react';
import { toGroupKindValue } from '@/features/group-kinds';
import { useUpdateGroupInfoMutation } from '../api';
import type { GroupTone } from '../schemas';
import { FOUNDED_YEAR_MESSAGE, GroupInfoFormSchema } from '../schemas';

type GroupToneChoice = GroupTone | '';

interface GroupInfoFormInput {
  groupId: number;
  description: string;
  isRecruiting: boolean;
  groupKindId: number | null;
  foundedYear: number | null;
  tone: GroupTone | null;
}

export interface GroupInfoFormControl {
  isEditing: boolean;
  start: () => void;
  cancel: () => void;
  description: string;
  setDescription: (value: string) => void;
  isRecruiting: boolean;
  setRecruiting: (value: boolean) => void;
  groupKindId: string;
  setGroupKindId: (value: string) => void;
  foundedYear: string;
  setFoundedYear: (value: string) => void;
  tone: GroupToneChoice;
  setTone: (value: GroupToneChoice) => void;
  foundedYearError: string | null;
  isDirty: boolean;
  isSaving: boolean;
  save: () => void;
}

const toFoundedYearValue = (foundedYear: number | null): string =>
  foundedYear === null ? '' : String(foundedYear);

const toToneValue = (tone: GroupTone | null): GroupToneChoice => tone ?? '';

export const useGroupInfoForm = ({
  groupId,
  description,
  isRecruiting,
  groupKindId,
  foundedYear,
  tone,
}: GroupInfoFormInput): GroupInfoFormControl => {
  const kindValue = toGroupKindValue(groupKindId);
  const yearValue = toFoundedYearValue(foundedYear);
  const toneValue = toToneValue(tone);

  const [isEditing, setEditing] = useState(false);
  const [draftDescription, setDraftDescription] = useState(description);
  const [draftRecruiting, setDraftRecruiting] = useState(isRecruiting);
  const [draftKind, setDraftKind] = useState(kindValue);
  const [draftYear, setDraftYear] = useState(yearValue);
  const [draftTone, setDraftTone] = useState<GroupToneChoice>(toneValue);
  const mutation = useUpdateGroupInfoMutation(groupId);

  const yearCheck = GroupInfoFormSchema.shape.foundedYear.safeParse(draftYear);
  const foundedYearError = yearCheck.success ? null : FOUNDED_YEAR_MESSAGE;

  const start = (): void => {
    setDraftDescription(description);
    setDraftRecruiting(isRecruiting);
    setDraftKind(kindValue);
    setDraftYear(yearValue);
    setDraftTone(toneValue);
    setEditing(true);
  };

  const cancel = (): void => {
    setEditing(false);
  };

  const save = (): void => {
    if (foundedYearError !== null) {
      return;
    }

    mutation.mutate(
      {
        description: draftDescription,
        isRecruiting: draftRecruiting,
        groupKindId: draftKind,
        foundedYear: draftYear,
        tone: draftTone,
      },
      { onSuccess: cancel },
    );
  };

  const isDirty =
    draftDescription !== description ||
    draftRecruiting !== isRecruiting ||
    draftKind !== kindValue ||
    draftYear !== yearValue ||
    draftTone !== toneValue;

  return {
    isEditing,
    start,
    cancel,
    description: draftDescription,
    setDescription: setDraftDescription,
    isRecruiting: draftRecruiting,
    setRecruiting: setDraftRecruiting,
    groupKindId: draftKind,
    setGroupKindId: setDraftKind,
    foundedYear: draftYear,
    setFoundedYear: setDraftYear,
    tone: draftTone,
    setTone: setDraftTone,
    foundedYearError,
    isDirty,
    isSaving: mutation.isPending,
    save,
  };
};
