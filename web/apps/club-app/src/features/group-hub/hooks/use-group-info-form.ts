import { useState } from 'react';
import { useUpdateGroupInfoMutation } from '../api';

interface GroupInfoFormInput {
  groupId: number;
  description: string;
  isRecruiting: boolean;
}

export interface GroupInfoFormControl {
  isEditing: boolean;
  start: () => void;
  cancel: () => void;
  description: string;
  setDescription: (value: string) => void;
  isRecruiting: boolean;
  setRecruiting: (value: boolean) => void;
  isDirty: boolean;
  isSaving: boolean;
  save: () => void;
}

export const useGroupInfoForm = ({
  groupId,
  description,
  isRecruiting,
}: GroupInfoFormInput): GroupInfoFormControl => {
  const [isEditing, setEditing] = useState(false);
  const [draftDescription, setDraftDescription] = useState(description);
  const [draftRecruiting, setDraftRecruiting] = useState(isRecruiting);
  const mutation = useUpdateGroupInfoMutation(groupId);

  const start = (): void => {
    setDraftDescription(description);
    setDraftRecruiting(isRecruiting);
    setEditing(true);
  };

  const cancel = (): void => {
    setEditing(false);
  };

  const save = (): void => {
    mutation.mutate(
      { description: draftDescription, isRecruiting: draftRecruiting },
      { onSuccess: cancel },
    );
  };

  return {
    isEditing,
    start,
    cancel,
    description: draftDescription,
    setDescription: setDraftDescription,
    isRecruiting: draftRecruiting,
    setRecruiting: setDraftRecruiting,
    isDirty: draftDescription !== description || draftRecruiting !== isRecruiting,
    isSaving: mutation.isPending,
    save,
  };
};
