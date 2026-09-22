import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { toGroupKindValue } from '@/features/group-kinds';
import { toLandingKey } from '@/features/write';
import { toFormFailures } from '@/lib/api/api-failures';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useUpdateGroupAdministrationMutation } from '../api';
import type { GroupHub } from '../schemas';
import { GroupAdministrationFormSchema } from '../schemas';

const FIELD_NAMES = ['name', 'groupKindId'] as const;

export interface GroupAdministrationEditorControl {
  name: string;
  setName: (value: string) => void;
  nameError: string | null;
  groupKindId: string;
  setGroupKindId: (value: string) => void;
  isDirty: boolean;
  isSaving: boolean;
  rejection: string | null;
  submit: () => void;
}

export const useGroupAdministrationEditor = (hub: GroupHub): GroupAdministrationEditorControl => {
  const initialName = hub.name;
  const initialGroupKindId = toGroupKindValue(hub.groupKindId);
  const [name, setName] = useState(initialName);
  const [groupKindId, setGroupKindId] = useState(initialGroupKindId);
  const [nameError, setNameError] = useState<string | null>(null);
  const [rejection, setRejection] = useState<string | null>(null);
  const mutation = useUpdateGroupAdministrationMutation(hub.groupId);
  const navigate = useNavigate();

  const isDirty = name !== initialName || groupKindId !== initialGroupKindId;

  const submit = (): void => {
    const draft = GroupAdministrationFormSchema.safeParse({ name, groupKindId });

    if (!draft.success) {
      setNameError(draft.error.issues[0]?.message ?? null);
      return;
    }

    setNameError(null);
    setRejection(null);
    mutation.mutate(draft.data, {
      onSuccess: () => {
        void navigate({
          to: '/groups/$groupId',
          params: { groupId: String(hub.groupId) },
          search: (previous) => ({
            ...previous,
            changed: toLandingKey('group-administration', hub.groupId),
          }),
          replace: true,
        });
      },
      onError: (error) => {
        const failures = toFormFailures(error, FIELD_NAMES);
        const nameFailure = failures.fields.find((failure) => failure.name === 'name');

        setNameError(nameFailure?.message ?? null);
        setRejection(
          failures.footer ?? (failures.fields.length === 0 ? toWriteErrorMessage(error) : null),
        );
      },
    });
  };

  return {
    name,
    setName,
    nameError,
    groupKindId,
    setGroupKindId,
    isDirty,
    isSaving: mutation.isPending,
    rejection,
    submit,
  };
};
