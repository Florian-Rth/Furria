import type { UseFormRegisterReturn } from 'react-hook-form';
import { useController } from 'react-hook-form';
import { useWriteForm } from '@/features/write/hooks/use-write-form';
import type { ClubIcon } from '@/lib/club-icon';
import type { GroupTone } from '@/lib/group-tone';
import { useUpdateGroupSettingsMutation } from '../api';
import { toGroupSettingsFormValues } from '../group-hub-labels';
import type { GroupHub } from '../schemas';
import { GroupSettingsFormSchema } from '../schemas';

type GroupToneChoice = GroupTone | '';

export interface GroupSettingsEditorControl {
  name: UseFormRegisterReturn<'name'>;
  nameError: string | undefined;
  description: string;
  setDescription: (value: string) => void;
  isRecruiting: boolean;
  setIsRecruiting: (value: boolean) => void;
  isManagementGroup: boolean;
  setIsManagementGroup: (value: boolean) => void;
  groupKindId: string;
  setGroupKindId: (value: string) => void;
  foundedYear: string;
  setFoundedYear: (value: string) => void;
  tone: GroupToneChoice;
  setTone: (value: GroupToneChoice) => void;
  icon: ClubIcon | null;
  setIcon: (value: ClubIcon | null) => void;
  foundedYearError: string | undefined;
  isDirty: boolean;
  canSubmit: boolean;
  isSaving: boolean;
  rejection: string | null;
  submit: () => void;
}

export const useGroupSettingsEditor = (
  hub: GroupHub,
  renames: boolean,
): GroupSettingsEditorControl => {
  const mutation = useUpdateGroupSettingsMutation(hub.groupId, renames);

  const write = useWriteForm({
    schema: GroupSettingsFormSchema,
    defaults: toGroupSettingsFormValues(hub),
    mutate: (values) => mutation.mutateAsync(values),
    landing: () => ({
      to: '/groups/$groupId',
      params: { groupId: hub.groupId },
    }),
  });
  const description = useController({ control: write.form.control, name: 'description' });
  const isRecruiting = useController({ control: write.form.control, name: 'isRecruiting' });
  const isManagementGroup = useController({
    control: write.form.control,
    name: 'isManagementGroup',
  });
  const groupKindId = useController({ control: write.form.control, name: 'groupKindId' });
  const foundedYear = useController({ control: write.form.control, name: 'foundedYear' });
  const tone = useController({ control: write.form.control, name: 'tone' });
  const icon = useController({ control: write.form.control, name: 'icon' });

  return {
    name: write.form.register('name'),
    nameError: write.form.formState.errors.name?.message,
    description: description.field.value,
    setDescription: description.field.onChange,
    isRecruiting: isRecruiting.field.value,
    setIsRecruiting: isRecruiting.field.onChange,
    isManagementGroup: isManagementGroup.field.value,
    setIsManagementGroup: isManagementGroup.field.onChange,
    groupKindId: groupKindId.field.value,
    setGroupKindId: groupKindId.field.onChange,
    foundedYear: foundedYear.field.value,
    setFoundedYear: foundedYear.field.onChange,
    tone: tone.field.value,
    setTone: tone.field.onChange,
    icon: icon.field.value,
    setIcon: icon.field.onChange,
    foundedYearError: write.form.formState.errors.foundedYear?.message,
    isDirty: write.isDirty,
    canSubmit: write.canSubmit,
    isSaving: write.isSaving,
    rejection: write.rejection,
    submit: write.submit,
  };
};
