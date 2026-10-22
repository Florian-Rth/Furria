import type { UseFormReturn } from 'react-hook-form';
import { useController } from 'react-hook-form';
import { useWriteForm } from '@/features/write/hooks/use-write-form';
import type { ClubIcon } from '@/lib/club-icon';
import type { GroupTone } from '@/lib/group-tone';
import { useCreateRoleMutation, useUpdateRoleMutation } from '../api';
import { toShownCoin } from '../role-coin';
import type { EditorReturn } from '../roles-hub';
import { toEditorLanding } from '../roles-hub';
import type { RoleForm } from '../schemas';
import { RoleFormSchema } from '../schemas';

const NO_ROLE = 0;

interface RoleEditorInput {
  roleId: number | null;
  initial: RoleForm;
  returnTo: EditorReturn;
}

export interface RoleEditorControl {
  form: UseFormReturn<RoleForm>;
  description: string;
  setDescription: (value: string) => void;
  touchDescription: () => void;
  showsCoin: boolean;
  setShowsCoin: (shows: boolean) => void;
  coinIcon: ClubIcon | null;
  setCoinIcon: (icon: ClubIcon | null) => void;
  coinTone: GroupTone | null;
  setCoinTone: (tone: GroupTone) => void;
  isDirty: boolean;
  canSubmit: boolean;
  isSaving: boolean;
  rejection: string | null;
  submit: () => void;
}

export const useRoleEditor = ({
  roleId,
  initial,
  returnTo,
}: RoleEditorInput): RoleEditorControl => {
  const create = useCreateRoleMutation();
  const update = useUpdateRoleMutation(roleId ?? NO_ROLE);

  const write = useWriteForm({
    schema: RoleFormSchema,
    defaults: initial,
    mutate: (values) =>
      roleId === null
        ? create.mutateAsync(values).then((created) => created.roleId)
        : update.mutateAsync(values).then(() => roleId),
    landing: (id) => toEditorLanding(id, returnTo),
  });
  const description = useController({ control: write.form.control, name: 'description' });
  const showsCoin = useController({ control: write.form.control, name: 'showsCoin' });
  const coinIcon = useController({ control: write.form.control, name: 'coinIcon' });
  const coinTone = useController({ control: write.form.control, name: 'coinTone' });

  const setShowsCoin = (shows: boolean): void => {
    showsCoin.field.onChange(shows);

    if (shows) {
      const shown = toShownCoin(coinIcon.field.value, coinTone.field.value);
      coinIcon.field.onChange(shown.icon);
      coinTone.field.onChange(shown.tone);
    }
  };

  return {
    ...write,
    description: description.field.value,
    setDescription: description.field.onChange,
    touchDescription: description.field.onBlur,
    showsCoin: showsCoin.field.value,
    setShowsCoin,
    coinIcon: coinIcon.field.value,
    setCoinIcon: coinIcon.field.onChange,
    coinTone: coinTone.field.value,
    setCoinTone: coinTone.field.onChange,
  };
};
