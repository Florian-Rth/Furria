import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { useManagedGroupsQuery } from '../api';
import {
  findGroupKindEntry,
  toGroupKindEntries,
  toGroupKindEntryId,
} from '../manage-groups-labels';
import { GroupKindEditor } from './GroupKindEditor';
import { ManageGroupsEditorDenied } from './ManageGroupsEditorDenied';
import { ManageGroupsEditorNotFound } from './ManageGroupsEditorNotFound';
import { ManageGroupsEditorSkeleton } from './ManageGroupsEditorSkeleton';

const ROUTE_ID = '/_app/manage/groups_/kinds/$groupKindId_/edit';
const TITLE = 'Gruppenart bearbeiten';

export const GroupKindEditScreen: FC = () => {
  const { groupKindId } = useParams({ from: ROUTE_ID });
  const id = toGroupKindEntryId(groupKindId);
  const groups = useManagedGroupsQuery();
  const permissions = usePermissions();

  if (groups.data === undefined) {
    return groups.isLoading ? <ManageGroupsEditorSkeleton /> : <ManageGroupsEditorNotFound />;
  }

  const entry = findGroupKindEntry(toGroupKindEntries(groups.data.kinds), id);

  if (entry === null || entry.isArchived) {
    return <ManageGroupsEditorNotFound />;
  }
  if (!(permissions.isUndecided || permissions.has(PERMISSION_KEYS.groupsManage))) {
    return <ManageGroupsEditorDenied title={TITLE} />;
  }

  return <GroupKindEditor entry={entry} />;
};
