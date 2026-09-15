import { KkButton, KkIcon } from '@furria/ui';
import type { FC } from 'react';
import { AppListLayout } from '@/features/session';
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
import { GroupOverrideNotFound } from './GroupOverrideNotFound';
import { GroupOverridePanel } from './GroupOverridePanel';
import { ManagedGroupsCreateFab } from './ManagedGroupsCreateFab';
import { ManagedGroupsGrid } from './ManagedGroupsGrid';
import { ManagedGroupsList } from './ManagedGroupsList';
import { ManagedGroupsToolbar } from './ManagedGroupsToolbar';
import { RestoreGroupDialog } from './RestoreGroupDialog';

const CREATE_LABEL = 'Gruppe anlegen';
const DETAIL_SIZE = 7;

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
  const hasSelection = selection.groupId !== null;
  const isFormOpen = dialogs.open === 'create' || dialogs.open === 'edit';
  const isArchiveOpen = dialogs.open === 'archive';
  const isRestoreOpen = dialogs.open === 'restore';
  const formGroup = dialogs.open === 'edit' ? selected : null;

  const onSaved = (groupId: number): void => {
    dialogs.close();
    selection.select(groupId);
  };

  const createButton = (
    <KkButton startIcon={<KkIcon name="add" size="small" />} onClick={dialogs.openCreate}>
      {CREATE_LABEL}
    </KkButton>
  );

  const toolbar = (
    <ManagedGroupsToolbar
      status={view.status}
      options={view.filterOptions}
      onStatusChange={view.selectStatus}
    />
  );

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

  const detail = isMissing || selected !== null ? selectedDetail : undefined;

  const list = hasSelection ? (
    <ManagedGroupsList
      groups={view.visible}
      selectedId={selection.groupId}
      isFiltered={view.isFiltered}
    />
  ) : (
    <ManagedGroupsGrid groups={view.visible} isFiltered={view.isFiltered} />
  );

  return (
    <>
      <AppListLayout
        sectionTitle={MANAGE_GROUPS_SECTION_TITLES.list}
        createAction={createButton}
        toolbar={toolbar}
        list={list}
        footnote={MANAGE_GROUPS_FOOTNOTE}
        aside={detail}
        asideSize={DETAIL_SIZE}
        asideRef={detailRef}
        stickyList={hasSelection}
      />
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
