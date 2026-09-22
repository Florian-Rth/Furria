import type { KkSelectOption } from '@furria/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
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
import type { BoardOfficeForm, ImpliedRoleOption } from '../schemas';
import { BoardOfficeFormSchema } from '../schemas';

const NO_BOARD_OFFICE = 0;
const NO_ROLES: readonly ImpliedRoleOption[] = [];

export interface BoardOfficeEditorControl {
  form: UseFormReturn<BoardOfficeForm>;
  canChangeRole: boolean;
  impliedRoleValue: string;
  setImpliedRoleValue: (value: string) => void;
  impliedRoleChoices: KkSelectOption[];
  impliedRoleStatement: string;
  isDirty: boolean;
  isSaving: boolean;
  rejection: string | null;
  submit: () => void;
}

export const useBoardOfficeEditor = (entry: BoardOfficeEntry | null): BoardOfficeEditorControl => {
  const boardOfficeId = entry?.boardOfficeId ?? null;
  const initial =
    entry === null
      ? { name: '', sortOrder: '1' }
      : { name: entry.name, sortOrder: String(entry.sortOrder) };
  const initialImpliedRoleValue = toImpliedRoleValue(entry?.impliedRoleId ?? null);

  const { has } = usePermissions();
  const canChangeRole = entry !== null && has(PERMISSION_KEYS.rolesManage) && !entry.isArchived;

  const [impliedRoleValue, setImpliedRoleValue] = useState(initialImpliedRoleValue);
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

  const form = useForm<BoardOfficeForm>({
    resolver: zodResolver(BoardOfficeFormSchema),
    defaultValues: initial,
  });

  const isDirty = form.formState.isDirty || impliedRoleValue !== initialImpliedRoleValue;

  const landBack = (id: number): void => {
    void navigate({
      to: '/manage/board',
      search: (previous) => ({ ...previous, changed: toLandingKey('board-office', id) }),
      replace: true,
    });
  };

  const handleFormSubmit = form.handleSubmit((values) => {
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

    const chosen = impliedRoleChoices.find((option) => option.value === impliedRoleValue);
    const impliedRoleId = toImpliedRoleId(impliedRoleValue);
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
    setImpliedRoleValue,
    impliedRoleChoices,
    impliedRoleStatement: toImpliedRoleStatement(entry?.impliedRoleName ?? null),
    isDirty,
    isSaving: create.isPending || update.isPending || setImpliedRole.isPending,
    rejection,
    submit: () => {
      void handleFormSubmit();
    },
  };
};
