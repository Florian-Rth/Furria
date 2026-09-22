import Grid from '@mui/material/Grid';
import type { FC } from 'react';
import { AddAdminDialog } from '@/features/group-hub';
import { useRefreshManagedGroups } from '../api';
import { useGroupDialogs } from '../hooks/use-group-dialogs';
import type { ManagedGroupsListing } from '../hooks/use-managed-groups-listing';
import { findManagedGroup } from '../manage-groups-labels';
import type { ManagedGroupKind, ManagedGroupSummary } from '../schemas';
import { ArchiveGroupDialog } from './ArchiveGroupDialog';
import { GroupFormDialog } from './GroupFormDialog';
import { GroupKindsPanel } from './GroupKindsPanel';
import { GroupRegister } from './GroupRegister';
import { RestoreGroupDialog } from './RestoreGroupDialog';

const VIEW_SPACING = { xs: 3, desktop: 3.5 };
const FULL_WIDTH = { xs: 12 };
const REGISTER_SLOT = { minWidth: 0, order: 1 } as const;
const KINDS_SLOT = { minWidth: 0, order: 2 } as const;

interface ManagedGroupsViewProps {
  groups: readonly ManagedGroupSummary[];
  kinds: readonly ManagedGroupKind[];
  listing: ManagedGroupsListing;
}

export const ManagedGroupsView: FC<ManagedGroupsViewProps> = ({ groups, kinds, listing }) => {
  const dialogs = useGroupDialogs();
  const refresh = useRefreshManagedGroups();

  const acted = findManagedGroup(groups, dialogs.groupId);

  const settleAppointment = (): void => {
    dialogs.close();
    refresh();
  };

  const appointDialog =
    acted === null ? null : (
      <AddAdminDialog
        groupId={acted.groupId}
        groupName={acted.name}
        open={dialogs.open === 'appoint'}
        onClose={dialogs.close}
        onAppointed={settleAppointment}
      />
    );

  return (
    <>
      <Grid container spacing={VIEW_SPACING} sx={{ minWidth: 0 }}>
        <Grid size={FULL_WIDTH} sx={REGISTER_SLOT}>
          <GroupRegister
            bands={listing.bands}
            filter={listing.filter}
            isFiltered={listing.isFiltered}
            onAppointAdmin={dialogs.openAppoint}
            onEdit={dialogs.openEdit}
            onArchive={dialogs.openArchive}
            onRestore={dialogs.openRestore}
          />
        </Grid>
        <Grid size={FULL_WIDTH} sx={KINDS_SLOT}>
          <GroupKindsPanel kinds={kinds} />
        </Grid>
      </Grid>
      <GroupFormDialog
        group={acted}
        open={dialogs.open === 'edit'}
        onClose={dialogs.close}
        onSaved={dialogs.close}
      />
      <ArchiveGroupDialog group={acted} open={dialogs.open === 'archive'} onClose={dialogs.close} />
      <RestoreGroupDialog group={acted} open={dialogs.open === 'restore'} onClose={dialogs.close} />
      {appointDialog}
    </>
  );
};
