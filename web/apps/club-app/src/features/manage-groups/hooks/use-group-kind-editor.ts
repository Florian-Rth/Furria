import type { UseFormReturn } from 'react-hook-form';
import { useWriteForm } from '@/features/write/hooks/use-write-form';
import { useCreateGroupKindMutation, useUpdateGroupKindMutation } from '../api';
import type { GroupKindEntry } from '../manage-groups-labels';
import type { GroupKindForm } from '../schemas';
import { GroupKindFormSchema } from '../schemas';

const LANDING_KIND = 'group-kind';

export interface GroupKindEditorControl {
  form: UseFormReturn<GroupKindForm>;
  isDirty: boolean;
  canSubmit: boolean;
  isSaving: boolean;
  rejection: string | null;
  submit: () => void;
}

export const useGroupKindEditor = (entry: GroupKindEntry | null): GroupKindEditorControl => {
  const create = useCreateGroupKindMutation();
  const update = useUpdateGroupKindMutation();

  return useWriteForm({
    schema: GroupKindFormSchema,
    defaults: { name: entry?.name ?? '' },
    mutate: (values) =>
      entry === null
        ? create.mutateAsync(values).then((created) => created.groupKindId)
        : update
            .mutateAsync({ groupKindId: entry.groupKindId, form: values })
            .then(() => entry.groupKindId),
    landing: (groupKindId) =>
      entry === null
        ? { to: '/manage/groups', mark: { kind: LANDING_KIND, id: groupKindId } }
        : {
            to: '/manage/groups/kinds/$groupKindId',
            params: { groupKindId },
            mark: { kind: LANDING_KIND, id: groupKindId },
          },
  });
};
