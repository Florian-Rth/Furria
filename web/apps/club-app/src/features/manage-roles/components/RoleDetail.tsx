import { KkPanelStack } from '@furria/ui';
import type { FC } from 'react';
import { usePermissions, useReturnFocus } from '@/features/session';
import { useRoleDialogs } from '../hooks/use-role-dialogs';
import { useRoleLifecycle } from '../hooks/use-role-lifecycle';
import { useRolePermissions } from '../hooks/use-role-permissions';
import type { RoleDetails } from '../schemas';
import { AddHolderDialog } from './AddHolderDialog';
import { ArchiveRoleDialog } from './ArchiveRoleDialog';
import { EndHoldingDialog } from './EndHoldingDialog';
import { RoleFormDialog } from './RoleFormDialog';
import { RoleHeaderCard } from './RoleHeaderCard';
import { RoleHoldersPanel } from './RoleHoldersPanel';
import { RolePastHoldersPanel } from './RolePastHoldersPanel';
import { RolePermissionList } from './RolePermissionList';

interface RoleDetailProps {
  role: RoleDetails;
  catalogue: readonly string[];
  holdersPending: boolean;
}

export const RoleDetail: FC<RoleDetailProps> = ({ role, catalogue, holdersPending }) => {
  const { isAffiliated } = usePermissions();
  const holdersFocus = useReturnFocus();
  const dialogs = useRoleDialogs(role.holders);
  const permissions = useRolePermissions(role, catalogue);
  const lifecycle = useRoleLifecycle({ role, onArchived: dialogs.close });

  const isArchived = role.archivedOn !== null;

  const openRename = (): void => {
    dialogs.open('rename');
  };

  const openAddHolder = (): void => {
    dialogs.open('add-holder');
  };

  const openArchive = (): void => {
    dialogs.open('archive');
  };

  const renamedRole = dialogs.openDialog === 'rename' ? role : null;

  const closeAfterEnding = (): void => {
    dialogs.close();
    holdersFocus.returnFocus();
  };

  return (
    <KkPanelStack>
      <RoleHeaderCard
        role={role}
        onRename={openRename}
        onArchive={openArchive}
        onRestore={lifecycle.restore}
        isRestoring={lifecycle.isRestoring}
      />
      <RoleHoldersPanel
        holders={role.holders}
        viewerIsAffiliated={isAffiliated}
        canAdd={!isArchived}
        pending={holdersPending}
        titleRef={holdersFocus.targetRef}
        onAdd={openAddHolder}
        onEnd={dialogs.openEndHolding}
      />
      <RolePermissionList
        permissions={permissions}
        roleName={role.name}
        holders={role.holders}
        isArchived={isArchived}
      />
      <RolePastHoldersPanel holders={role.pastHolders} />
      <RoleFormDialog
        open={dialogs.openDialog === 'rename'}
        editedRole={renamedRole}
        onClose={dialogs.close}
        onSaved={dialogs.close}
      />
      <AddHolderDialog
        roleId={role.roleId}
        roleName={role.name}
        open={dialogs.openDialog === 'add-holder'}
        onClose={dialogs.close}
      />
      <ArchiveRoleDialog
        role={role}
        open={dialogs.openDialog === 'archive'}
        onClose={dialogs.close}
        lifecycle={lifecycle}
      />
      <EndHoldingDialog
        roleId={role.roleId}
        roleName={role.name}
        holder={dialogs.endHolder}
        onClose={dialogs.close}
        onEnded={closeAfterEnding}
      />
    </KkPanelStack>
  );
};
