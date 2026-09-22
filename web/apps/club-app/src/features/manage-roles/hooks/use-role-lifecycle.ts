import { useState } from 'react';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useArchiveRoleMutation, useRestoreRoleMutation } from '../api';
import type { RoleDetails } from '../schemas';

interface RoleLifecycleInput {
  role: RoleDetails;
  onArchived: () => void;
  onRestored: () => void;
}

export interface RoleLifecycleControl {
  archive: () => void;
  restore: () => void;
  isArchiving: boolean;
  isRestoring: boolean;
  rejection: string | null;
}

export const useRoleLifecycle = ({
  role,
  onArchived,
  onRestored,
}: RoleLifecycleInput): RoleLifecycleControl => {
  const [rejection, setRejection] = useState<string | null>(null);
  const archiveMutation = useArchiveRoleMutation(role.roleId);
  const restoreMutation = useRestoreRoleMutation(role.roleId);

  const archive = (): void => {
    setRejection(null);
    archiveMutation.mutate(
      { roleName: role.name },
      {
        onSuccess: onArchived,
        onError: (error) => {
          setRejection(toWriteErrorMessage(error));
        },
      },
    );
  };

  const restore = (): void => {
    setRejection(null);
    restoreMutation.mutate(
      { roleName: role.name },
      {
        onSuccess: onRestored,
        onError: (error) => {
          setRejection(toWriteErrorMessage(error));
        },
      },
    );
  };

  return {
    archive,
    restore,
    isArchiving: archiveMutation.isPending,
    isRestoring: restoreMutation.isPending,
    rejection,
  };
};
