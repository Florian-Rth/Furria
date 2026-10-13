import type { KkSelectOption } from '@furria/ui';
import type { UseFormReturn } from 'react-hook-form';
import { useController } from 'react-hook-form';
import { usePermissions } from '@/features/session';
import { useWriteForm } from '@/features/write';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import {
  useCreateBoardOfficeMutation,
  useImpliedRoleOptionsQuery,
  useSetImpliedRoleMutation,
  useUpdateBoardOfficeMutation,
} from '../api';
import type { BoardOfficeEntry } from '../manage-board-labels';
import {
  toImpliedRoleChoices,
  toImpliedRoleId,
  toImpliedRoleStatement,
  toImpliedRoleValue,
} from '../manage-board-labels';
import { toImpliedRoleOptionsErrorMessage } from '../manage-board-messages';
import type { BoardOfficeEditorForm, ImpliedRoleOption } from '../schemas';
import { BoardOfficeEditorFormSchema } from '../schemas';

const NO_BOARD_OFFICE = 0;
const NO_ROLES: readonly ImpliedRoleOption[] = [];

export interface BoardOfficeEditorControl {
  form: UseFormReturn<BoardOfficeEditorForm>;
  sortOrder: string;
  setSortOrder: (value: string) => void;
  canChangeRole: boolean;
  impliedRoleValue: string;
  setImpliedRoleValue: (value: string) => void;
  impliedRoleChoices: KkSelectOption[];
  impliedRoleChoicesPending: boolean;
  impliedRoleChoicesError: string | null;
  impliedRoleStatement: string;
  isDirty: boolean;
  canSubmit: boolean;
  isSaving: boolean;
  rejection: string | null;
  submit: () => void;
}

export const useBoardOfficeEditor = (entry: BoardOfficeEntry | null): BoardOfficeEditorControl => {
  const boardOfficeId = entry?.boardOfficeId ?? null;
  const initialImpliedRoleValue = toImpliedRoleValue(entry?.impliedRoleId ?? null);
  const initial: BoardOfficeEditorForm =
    entry === null
      ? { name: '', sortOrder: '1', impliedRoleValue: initialImpliedRoleValue }
      : {
          name: entry.name,
          sortOrder: String(entry.sortOrder),
          impliedRoleValue: initialImpliedRoleValue,
        };

  const { has } = usePermissions();
  const canChangeRole = entry !== null && has(PERMISSION_KEYS.rolesManage) && !entry.isArchived;

  const roleOptions = useImpliedRoleOptionsQuery(canChangeRole);
  const roles = roleOptions.data?.roles ?? NO_ROLES;
  const impliedRoleChoices = toImpliedRoleChoices(
    roles,
    entry?.impliedRoleId ?? null,
    entry?.impliedRoleName ?? null,
  );

  const create = useCreateBoardOfficeMutation();
  const update = useUpdateBoardOfficeMutation(boardOfficeId ?? NO_BOARD_OFFICE);
  const setImpliedRole = useSetImpliedRoleMutation(boardOfficeId ?? NO_BOARD_OFFICE);

  const saveOffice = async (
    officeId: number,
    chosenValue: string,
    values: Omit<BoardOfficeEditorForm, 'impliedRoleValue'>,
  ): Promise<number> => {
    await update.mutateAsync(values);

    if (!canChangeRole) {
      return officeId;
    }

    const chosen = impliedRoleChoices.find((option) => option.value === chosenValue);
    const impliedRoleId = toImpliedRoleId(chosenValue);
    const impliedRoleName = impliedRoleId === null ? null : (chosen?.label ?? null);

    await setImpliedRole.mutateAsync({ officeName: values.name, impliedRoleId, impliedRoleName });

    return officeId;
  };

  const write = useWriteForm({
    schema: BoardOfficeEditorFormSchema,
    defaults: initial,
    mutate: ({ impliedRoleValue: chosenValue, ...values }) =>
      boardOfficeId === null
        ? create.mutateAsync(values).then((created) => created.boardOfficeId)
        : saveOffice(boardOfficeId, chosenValue, values),
    landing: (id) => ({ to: '/manage/board', mark: { kind: 'board-office', id } }),
  });
  const impliedRole = useController({ control: write.form.control, name: 'impliedRoleValue' });
  const sortOrder = useController({ control: write.form.control, name: 'sortOrder' });

  return {
    ...write,
    sortOrder: sortOrder.field.value,
    setSortOrder: sortOrder.field.onChange,
    canChangeRole,
    impliedRoleValue: impliedRole.field.value,
    setImpliedRoleValue: impliedRole.field.onChange,
    impliedRoleChoices,
    impliedRoleChoicesPending: roleOptions.data === undefined,
    impliedRoleChoicesError: toImpliedRoleOptionsErrorMessage(roleOptions.error),
    impliedRoleStatement: toImpliedRoleStatement(entry?.impliedRoleName ?? null),
  };
};
