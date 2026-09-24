import { KkPanelStack, KkWriteScreen } from '@furria/ui';
import type { FC } from 'react';
import { useState } from 'react';
import { useLanding } from '@/features/write';
import { useRoleLifecycle } from '../hooks/use-role-lifecycle';
import { useRolePermissions } from '../hooks/use-role-permissions';
import type { RoleDetails } from '../schemas';
import { ArchiveRoleDialog } from './ArchiveRoleDialog';
import { RestoreRoleDialog } from './RestoreRoleDialog';
import { RoleHeaderCard } from './RoleHeaderCard';
import { RoleHoldersPanel } from './RoleHoldersPanel';
import { RolePastHoldersPanel } from './RolePastHoldersPanel';
import { RolePermissionList } from './RolePermissionList';

const ARCHIVE_LABEL = 'Rolle archivieren';

interface RoleDetailProps {
  role: RoleDetails;
  catalogue: readonly string[];
  holdersPending: boolean;
}

export const RoleDetail: FC<RoleDetailProps> = ({ role, catalogue, holdersPending }) => {
  const { highlightedKey } = useLanding();
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);
  const permissions = useRolePermissions(role, catalogue);
  const lifecycle = useRoleLifecycle({
    role,
    onArchived: () => {
      setArchiveOpen(false);
    },
    onRestored: () => {
      setRestoreOpen(false);
    },
  });

  const isArchived = role.archivedOn !== null;

  const openArchive = (): void => {
    setArchiveOpen(true);
  };

  const closeArchive = (): void => {
    setArchiveOpen(false);
  };

  const openRestore = (): void => {
    setRestoreOpen(true);
  };

  const closeRestore = (): void => {
    setRestoreOpen(false);
  };

  const danger = isArchived ? null : (
    <KkWriteScreen.Danger label={ARCHIVE_LABEL} onSelect={openArchive} />
  );

  return (
    <KkPanelStack>
      <RoleHeaderCard role={role} onOpenRestore={openRestore} isRestoring={lifecycle.isRestoring} />
      <RoleHoldersPanel
        roleId={role.roleId}
        holders={role.holders}
        canAdd={!isArchived}
        pending={holdersPending}
        highlightedKey={highlightedKey}
      />
      <RolePermissionList
        permissions={permissions}
        roleName={role.name}
        holders={role.holders}
        isArchived={isArchived}
      />
      <RolePastHoldersPanel holders={role.pastHolders} />
      {danger}
      <ArchiveRoleDialog
        role={role}
        open={archiveOpen}
        onClose={closeArchive}
        lifecycle={lifecycle}
      />
      <RestoreRoleDialog
        role={role}
        open={restoreOpen}
        onClose={closeRestore}
        lifecycle={lifecycle}
      />
    </KkPanelStack>
  );
};
