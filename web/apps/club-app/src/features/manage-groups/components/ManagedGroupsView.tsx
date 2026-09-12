import { KkButton, KkIcon, KkLead, KkNote } from '@furria/ui';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useGroupDialogs } from '../hooks/use-group-dialogs';
import { useGroupSelection } from '../hooks/use-group-selection';
import { useManagedGroupsView } from '../hooks/use-managed-groups-view';
import { useScrollIntoView } from '../hooks/use-scroll-into-view';
import {
  findManagedGroup,
  MANAGE_GROUPS_FOOTNOTE,
  MANAGE_GROUPS_SECTION_TITLES,
} from '../manage-groups-labels';
import type { ManagedGroupSummary } from '../schemas';
import { ArchiveGroupDialog } from './ArchiveGroupDialog';
import { GroupFormDialog } from './GroupFormDialog';
import { GroupOverrideEmpty } from './GroupOverrideEmpty';
import { GroupOverrideNotFound } from './GroupOverrideNotFound';
import { GroupOverridePanel } from './GroupOverridePanel';
import { ManagedGroupsCreateFab } from './ManagedGroupsCreateFab';
import { ManagedGroupsList } from './ManagedGroupsList';
import { ManagedGroupsSection } from './ManagedGroupsSection';
import { ManagedGroupsToolbar } from './ManagedGroupsToolbar';
import { RestoreGroupDialog } from './RestoreGroupDialog';

const CREATE_LABEL = 'Gruppe anlegen';

interface ManagedGroupsViewProps {
  groups: readonly ManagedGroupSummary[];
}

export const ManagedGroupsView: FC<ManagedGroupsViewProps> = ({ groups }) => {
  const view = useManagedGroupsView(groups);
  const selection = useGroupSelection();
  const dialogs = useGroupDialogs();
  const detailRef = useScrollIntoView(selection.groupId);

  const selected = findManagedGroup(groups, selection.groupId);
  const isMissing = selection.groupId !== null && selected === null;
  const isFormOpen = dialogs.open === 'create' || dialogs.open === 'edit';
  const isArchiveOpen = dialogs.open === 'archive';
  const isRestoreOpen = dialogs.open === 'restore';
  const formGroup = dialogs.open === 'edit' ? selected : null;

  const onSaved = (groupId: number): void => {
    dialogs.close();
    selection.select(groupId);
  };

  const createAction = (
    <KkButton
      size="small"
      variant="outlined"
      startIcon={<KkIcon name="add" size="small" />}
      onClick={dialogs.openCreate}
    >
      {CREATE_LABEL}
    </KkButton>
  );

  const detail =
    selected === null ? null : (
      <GroupOverridePanel
        group={selected}
        onEdit={dialogs.openEdit}
        onArchive={dialogs.openArchive}
        onRestore={dialogs.openRestore}
      />
    );

  const missingDetail = isMissing ? <GroupOverrideNotFound onClear={selection.clear} /> : null;
  const emptyDetail = selection.groupId === null ? <GroupOverrideEmpty /> : null;

  return (
    <>
      <Stack sx={{ gap: 3, minWidth: 0 }}>
        <KkLead>{view.intro}</KkLead>
        <Grid container spacing={{ xs: 3.5, desktop: 5 }} sx={{ minWidth: 0 }}>
          <Grid size={{ xs: 12, desktop: 5 }} sx={{ minWidth: 0 }}>
            <Stack sx={{ gap: 2.5, minWidth: 0 }}>
              <ManagedGroupsSection title={MANAGE_GROUPS_SECTION_TITLES.list} action={createAction}>
                <Stack sx={{ gap: 2, minWidth: 0 }}>
                  <ManagedGroupsToolbar
                    query={view.query}
                    onQueryChange={view.setQuery}
                    status={view.status}
                    options={view.filterOptions}
                    onStatusChange={view.selectStatus}
                  />
                  <ManagedGroupsList
                    groups={view.visible}
                    selectedId={selection.groupId}
                    onSelect={selection.select}
                    isFiltered={view.isFiltered}
                  />
                </Stack>
              </ManagedGroupsSection>
              <KkNote>{MANAGE_GROUPS_FOOTNOTE}</KkNote>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, desktop: 7 }} sx={{ minWidth: 0 }} ref={detailRef}>
            {emptyDetail}
            {missingDetail}
            {detail}
          </Grid>
        </Grid>
      </Stack>
      <ManagedGroupsCreateFab onCreate={dialogs.openCreate} />
      <GroupFormDialog
        group={formGroup}
        open={isFormOpen}
        onClose={dialogs.close}
        onSaved={onSaved}
      />
      <ArchiveGroupDialog group={selected} open={isArchiveOpen} onClose={dialogs.close} />
      <RestoreGroupDialog group={selected} open={isRestoreOpen} onClose={dialogs.close} />
    </>
  );
};
