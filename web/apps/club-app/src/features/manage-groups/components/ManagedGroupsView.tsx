import { KkNote, KkRegisterExpansion } from '@furria/ui';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { toGroupTone } from '@/features/groups';
import { useAppointIntent } from '../hooks/use-appoint-intent';
import { useGroupDialogs } from '../hooks/use-group-dialogs';
import { useGroupSelection } from '../hooks/use-group-selection';
import type { ManagedGroupsListing } from '../hooks/use-managed-groups-listing';
import { useScrollIntoView } from '../hooks/use-scroll-into-view';
import { findManagedGroup, MANAGE_GROUPS_FOOTNOTE } from '../manage-groups-labels';
import { isGroupBanded } from '../manage-groups-work';
import type { ManagedGroupKind, ManagedGroupSummary } from '../schemas';
import { ArchiveGroupDialog } from './ArchiveGroupDialog';
import { GroupFormDialog } from './GroupFormDialog';
import { GroupKindsPanel } from './GroupKindsPanel';
import { GroupOverrideNotFound } from './GroupOverrideNotFound';
import { GroupOverridePanel } from './GroupOverridePanel';
import { GroupRegister } from './GroupRegister';
import { RestoreGroupDialog } from './RestoreGroupDialog';

const VIEW_SPACING = { xs: 3, desktop: 3.5 };
const FULL_WIDTH = { xs: 12 };
const KINDS_SLOT = { minWidth: 0, order: { xs: 2, desktop: 1 } } as const;
const REGISTER_SLOT = { minWidth: 0, order: { xs: 1, desktop: 2 } } as const;
const TRAILING_SLOT = { minWidth: 0, order: 3 } as const;
const FOOTNOTE_SLOT = { minWidth: 0, order: 4 } as const;
const DETAIL = { minWidth: 0, scrollMarginTop: 2 } as const;

interface ManagedGroupsViewProps {
  groups: readonly ManagedGroupSummary[];
  kinds: readonly ManagedGroupKind[];
  listing: ManagedGroupsListing;
}

export const ManagedGroupsView: FC<ManagedGroupsViewProps> = ({ groups, kinds, listing }) => {
  const selection = useGroupSelection();
  const dialogs = useGroupDialogs();
  const appoint = useAppointIntent();
  const detailRef = useScrollIntoView(selection.groupId);

  const acted = findManagedGroup(groups, dialogs.groupId);
  const selected = findManagedGroup(groups, selection.groupId);
  const isMissing = selection.groupId !== null && selected === null;
  const isInline = selected !== null && isGroupBanded(listing.bands, selected.groupId);

  const appointAdmin = (groupId: number): void => {
    selection.select(groupId);
    appoint.request(groupId);
  };

  const panel =
    selected === null ? (
      <GroupOverrideNotFound onClear={selection.clear} />
    ) : (
      <GroupOverridePanel
        group={selected}
        appointToken={appoint.tokenFor(selected.groupId)}
        onClear={selection.clear}
      />
    );

  const detail =
    isMissing || selected !== null ? (
      <Stack ref={detailRef} sx={DETAIL}>
        {panel}
      </Stack>
    ) : null;

  const inlineDetail =
    isInline && selected !== null ? (
      <KkRegisterExpansion groupTone={toGroupTone(selected.groupId, selected.tone)}>
        {detail}
      </KkRegisterExpansion>
    ) : null;

  const trailingDetail = isInline ? null : detail;

  const trailingSlot =
    trailingDetail === null ? null : (
      <Grid size={FULL_WIDTH} sx={TRAILING_SLOT}>
        {trailingDetail}
      </Grid>
    );

  return (
    <>
      <Grid container spacing={VIEW_SPACING} sx={{ minWidth: 0 }}>
        <Grid size={FULL_WIDTH} sx={KINDS_SLOT}>
          <GroupKindsPanel kinds={kinds} />
        </Grid>
        <Grid size={FULL_WIDTH} sx={REGISTER_SLOT}>
          <GroupRegister
            bands={listing.bands}
            filter={listing.filter}
            selectedId={selection.groupId}
            isFiltered={listing.isFiltered}
            detail={inlineDetail}
            onSelect={selection.select}
            onAppointAdmin={appointAdmin}
            onEdit={dialogs.openEdit}
            onArchive={dialogs.openArchive}
            onRestore={dialogs.openRestore}
          />
        </Grid>
        {trailingSlot}
        <Grid size={FULL_WIDTH} sx={FOOTNOTE_SLOT}>
          <KkNote>{MANAGE_GROUPS_FOOTNOTE}</KkNote>
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
    </>
  );
};
