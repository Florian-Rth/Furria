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
    void archiveMutation.mutateAsync({ roleName: role.name }).then(onArchived, (error: Error) => {
      setRejection(toWriteErrorMessage(error));
    });
  };

  const restore = (): void => {
    setRejection(null);
    void restoreMutation.mutateAsync({ roleName: role.name }).then(onRestored, (error: Error) => {
      setRejection(toWriteErrorMessage(error));
    });
  };

  return {
    archive,
    restore,
    isArchiving: archiveMutation.isPending,
    isRestoring: restoreMutation.isPending,
    rejection,
  };
};
