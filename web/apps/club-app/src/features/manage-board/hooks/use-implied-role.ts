import type { KkSelectOption } from '@furria/ui';
import { usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { useImpliedRoleOptionsQuery, useSetImpliedRoleMutation } from '../api';
import type { BoardOfficeEntry } from '../manage-board-labels';
import { toImpliedRoleChoices, toImpliedRoleId, toImpliedRoleValue } from '../manage-board-labels';
import type { ImpliedRoleOption } from '../schemas';

const NO_ROLES: readonly ImpliedRoleOption[] = [];

export interface ImpliedRoleControl {
  canChange: boolean;
  value: string;
  choices: KkSelectOption[];
  isSaving: boolean;
  change: (value: string) => void;
}

export const useImpliedRole = (office: BoardOfficeEntry): ImpliedRoleControl => {
  const { has } = usePermissions();
  const canChange = has(PERMISSION_KEYS.rolesManage) && !office.isArchived;
  const options = useImpliedRoleOptionsQuery(canChange);
  const mutation = useSetImpliedRoleMutation(office.boardOfficeId);
  const roles = options.data?.roles ?? NO_ROLES;
  const choices = toImpliedRoleChoices(roles, office.impliedRoleId, office.impliedRoleName);

  const change = (value: string): void => {
    const impliedRoleId = toImpliedRoleId(value);
    const chosen = choices.find((option) => option.value === value);

    mutation.mutate({
      officeName: office.name,
      impliedRoleId,
      impliedRoleName: impliedRoleId === null ? null : (chosen?.label ?? null),
    });
  };

  return {
    canChange,
    value: toImpliedRoleValue(office.impliedRoleId),
    choices,
    isSaving: mutation.isPending,
    change,
  };
};
