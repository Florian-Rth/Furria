import type { UseFormReturn } from 'react-hook-form';
import { useController } from 'react-hook-form';
import { useWriteForm } from '@/features/write';
import type { ClubIcon } from '@/lib/club-icon';
import { useCreateGroupMutation } from '../api';
import type { GroupForm } from '../schemas';
import { GroupFormSchema } from '../schemas';

const EMPTY_VALUES: GroupForm = { name: '', groupKindId: '', icon: null };

export interface GroupCreateEditorControl {
  form: UseFormReturn<GroupForm>;
  groupKindId: string;
  setGroupKindId: (value: string) => void;
  icon: ClubIcon | null;
  setIcon: (value: ClubIcon | null) => void;
  isDirty: boolean;
  canSubmit: boolean;
  isSaving: boolean;
  rejection: string | null;
  submit: () => void;
}

export const useGroupCreateEditor = (): GroupCreateEditorControl => {
  const mutation = useCreateGroupMutation();

  const write = useWriteForm({
    schema: GroupFormSchema,
    defaults: EMPTY_VALUES,
    mutate: (values) => mutation.mutateAsync(values).then((created) => created.groupId),
    landing: (groupId) => ({ to: '/manage/groups', mark: { kind: 'group', id: groupId } }),
  });
  const groupKindId = useController({ control: write.form.control, name: 'groupKindId' });
  const icon = useController({ control: write.form.control, name: 'icon' });

  return {
    ...write,
    groupKindId: groupKindId.field.value,
    setGroupKindId: groupKindId.field.onChange,
    icon: icon.field.value,
    setIcon: icon.field.onChange,
  };
};
