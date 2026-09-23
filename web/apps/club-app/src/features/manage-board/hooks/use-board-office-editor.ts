import type { KkSelectOption } from '@furria/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useController, useForm } from 'react-hook-form';
import { usePermissions } from '@/features/session';
import { toLandingKey } from '@/features/write';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { toWriteErrorMessage } from '@/lib/write-error';
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

  const [rejection, setRejection] = useState<string | null>(null);

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
  const navigate = useNavigate();

  const form = useForm<BoardOfficeEditorForm>({
    resolver: zodResolver(BoardOfficeEditorFormSchema),
    defaultValues: initial,
    mode: 'onTouched',
  });
  const { isDirty, isValid } = form.formState;
  const impliedRole = useController({ control: form.control, name: 'impliedRoleValue' });
  const impliedRoleValue = impliedRole.field.value;

  const landBack = (id: number): void => {
    void navigate({
      to: '/manage/board',
      search: (previous) => ({ ...previous, changed: toLandingKey('board-office', id) }),
      replace: true,
    });
  };

  const handleFormSubmit = form.handleSubmit(({ impliedRoleValue: chosenValue, ...values }) => {
    setRejection(null);

    if (boardOfficeId === null) {
      create.mutate(values, {
        onSuccess: (created) => {
          landBack(created.boardOfficeId);
        },
        onError: (error) => {
          setRejection(toWriteErrorMessage(error));
        },
      });

      return;
    }

    const chosen = impliedRoleChoices.find((option) => option.value === chosenValue);
    const impliedRoleId = toImpliedRoleId(chosenValue);
    const impliedRoleName = impliedRoleId === null ? null : (chosen?.label ?? null);

    update.mutate(values, {
      onSuccess: () => {
        if (!canChangeRole) {
          landBack(boardOfficeId);
          return;
        }

        setImpliedRole.mutate(
          { officeName: values.name, impliedRoleId, impliedRoleName },
          {
            onSuccess: () => {
              landBack(boardOfficeId);
            },
            onError: (error) => {
              setRejection(toWriteErrorMessage(error));
            },
          },
        );
      },
      onError: (error) => {
        setRejection(toWriteErrorMessage(error));
      },
    });
  });

  return {
    form,
    canChangeRole,
    impliedRoleValue,
    setImpliedRoleValue: impliedRole.field.onChange,
    impliedRoleChoices,
    impliedRoleChoicesPending: roleOptions.data === undefined,
    impliedRoleChoicesError: toImpliedRoleOptionsErrorMessage(roleOptions.error),
    impliedRoleStatement: toImpliedRoleStatement(entry?.impliedRoleName ?? null),
    isDirty,
    canSubmit: isValid,
    isSaving: create.isPending || update.isPending || setImpliedRole.isPending,
    rejection,
    submit: () => {
      void handleFormSubmit();
    },
  };
};
