import { useController } from 'react-hook-form';
import { useWriteForm } from '@/features/write';
import type { GroupTone } from '@/lib/group-tone';
import { useUpdateGroupInfoMutation } from '../api';
import { toGroupInfoFormValues } from '../group-hub-labels';
import type { GroupHub } from '../schemas';
import { GroupInfoFormSchema } from '../schemas';

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
  foundedYearError: string | undefined;
  isDirty: boolean;
  canSubmit: boolean;
  isSaving: boolean;
  rejection: string | null;
  submit: () => void;
}

export const useGroupInfoEditor = (hub: GroupHub): GroupInfoEditorControl => {
  const mutation = useUpdateGroupInfoMutation(hub.groupId);

  const write = useWriteForm({
    schema: GroupInfoFormSchema,
    defaults: toGroupInfoFormValues(hub),
    mutate: (values) => mutation.mutateAsync({ ...values, isRecruiting: hub.isRecruiting }),
    landing: () => ({
      to: '/groups/$groupId',
      params: { groupId: hub.groupId },
      mark: { kind: 'group-info', id: hub.groupId },
    }),
  });
  const description = useController({ control: write.form.control, name: 'description' });
  const groupKindId = useController({ control: write.form.control, name: 'groupKindId' });
  const foundedYear = useController({ control: write.form.control, name: 'foundedYear' });
  const tone = useController({ control: write.form.control, name: 'tone' });

  return {
    description: description.field.value,
    setDescription: description.field.onChange,
    groupKindId: groupKindId.field.value,
    setGroupKindId: groupKindId.field.onChange,
    foundedYear: foundedYear.field.value,
    setFoundedYear: foundedYear.field.onChange,
    tone: tone.field.value,
    setTone: tone.field.onChange,
    foundedYearError: write.form.formState.errors.foundedYear?.message,
    isDirty: write.isDirty,
    canSubmit: write.canSubmit,
    isSaving: write.isSaving,
    rejection: write.rejection,
    submit: write.submit,
  };
};
