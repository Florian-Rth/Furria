import { useState } from 'react';
import { useArchiveRoleMutation, useRestoreRoleMutation } from '../api';
import { toWriteErrorMessage } from '../manage-roles-messages';
import type { RoleDetails } from '../schemas';

interface RoleLifecycleInput {
  role: RoleDetails;
  onArchived: () => void;
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
    restoreMutation.mutate({ roleName: role.name });
  };

  return {
    archive,
    restore,
    isArchiving: archiveMutation.isPending,
    isRestoring: restoreMutation.isPending,
    rejection,
  };
};
