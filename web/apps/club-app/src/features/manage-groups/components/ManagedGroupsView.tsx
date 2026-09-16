import { KkNote } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useGroupDialogs } from '../hooks/use-group-dialogs';
import { useGroupSelection } from '../hooks/use-group-selection';
import type { ManagedGroupsListing } from '../hooks/use-managed-groups-listing';
import { useScrollIntoView } from '../hooks/use-scroll-into-view';
import { findManagedGroup, MANAGE_GROUPS_FOOTNOTE } from '../manage-groups-labels';
import type { ManagedGroupSummary } from '../schemas';
import { ArchiveGroupDialog } from './ArchiveGroupDialog';
import { GroupFormDialog } from './GroupFormDialog';
import { GroupOverrideNotFound } from './GroupOverrideNotFound';
import { GroupOverridePanel } from './GroupOverridePanel';
import { ManagedGroupsGrid } from './ManagedGroupsGrid';
import { ManagedGroupsList } from './ManagedGroupsList';
import { RestoreGroupDialog } from './RestoreGroupDialog';

const VIEW_GAP = 3;
const DETAIL_SCROLL_MARGIN = 2;

interface ManagedGroupsViewProps {
  groups: readonly ManagedGroupSummary[];
  listing: ManagedGroupsListing;
}

export const ManagedGroupsView: FC<ManagedGroupsViewProps> = ({ groups, listing }) => {
  const selection = useGroupSelection();
  const dialogs = useGroupDialogs();
  const detailRef = useScrollIntoView(selection.groupId);

  const selected = findManagedGroup(groups, selection.groupId);
  const isMissing = selection.groupId !== null && selected === null;
  const hasSelection = selection.groupId !== null;

  const selectedDetail =
    selected === null ? (
      <GroupOverrideNotFound onClear={selection.clear} />
    ) : (
      <GroupOverridePanel
        group={selected}
        onEdit={dialogs.openEdit}
        onArchive={dialogs.openArchive}
        onRestore={dialogs.openRestore}
      />
    );

  const detail =
    isMissing || selected !== null ? (
      <Stack ref={detailRef} sx={{ minWidth: 0, scrollMarginTop: DETAIL_SCROLL_MARGIN }}>
        {selectedDetail}
      </Stack>
    ) : null;

  const list = hasSelection ? (
    <ManagedGroupsList
      groups={listing.visible}
      selectedId={selection.groupId}
      isFiltered={listing.isFiltered}
      onSelect={selection.select}
    />
  ) : (
    <ManagedGroupsGrid
      groups={listing.visible}
      isFiltered={listing.isFiltered}
      onSelect={selection.select}
    />
  );

  return (
    <>
      <Stack sx={{ gap: VIEW_GAP, minWidth: 0 }}>
        {list}
        {detail}
        <KkNote>{MANAGE_GROUPS_FOOTNOTE}</KkNote>
      </Stack>
      <GroupFormDialog
        group={selected}
        open={dialogs.open === 'edit'}
        onClose={dialogs.close}
        onSaved={dialogs.close}
      />
      <ArchiveGroupDialog
        group={selected}
        open={dialogs.open === 'archive'}
        onClose={dialogs.close}
      />
      <RestoreGroupDialog
        group={selected}
        open={dialogs.open === 'restore'}
        onClose={dialogs.close}
      />
    </>
  );
};
