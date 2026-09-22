import { KkEmptyState, KkPanel, KkScreen, KkSkeletonBlock } from '@furria/ui';
import { useParams } from '@tanstack/react-router';
import type { FC, ReactNode } from 'react';
import { AccessDenied, usePermissions } from '@/features/session';
import { toLandingKey, useLanding } from '@/features/write';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { useManagedGroupsQuery } from '../api';
import {
  findGroupKindEntry,
  MANAGE_GROUPS_ORIGIN,
  toGroupKindEntries,
  toGroupKindEntryId,
} from '../manage-groups-labels';
import { GroupKindPage } from './GroupKindPage';

const ROUTE_ID = '/_app/manage/groups_/kinds/$groupKindId';
const TITLE_FALLBACK = 'Gruppenart';
const NOT_FOUND_TITLE = 'NICHT MEHR DA';
const NOT_FOUND_DESCRIPTION = 'Diese Gruppenart gibt es nicht mehr.';
const DENIED_MESSAGE =
  'Die Gruppenverwaltung ist an eine Rolle gebunden. Du hast sie gerade nicht.';
const SKELETON_LINES = 4;

export const GroupKindScreen: FC = () => {
  const { groupKindId } = useParams({ from: ROUTE_ID });
  const id = toGroupKindEntryId(groupKindId);
  const groups = useManagedGroupsQuery();
  const permissions = usePermissions();
  const { highlightedKey } = useLanding();
  const entries = toGroupKindEntries(groups.data?.kinds ?? []);
  const entry = findGroupKindEntry(entries, id);
  const openEntry = entry !== null && !entry.isArchived ? entry : null;
  const canManage = permissions.isUndecided || permissions.has(PERMISSION_KEYS.groupsManage);
  const title = entry === null ? TITLE_FALLBACK : entry.name;

  let body: ReactNode;

  if (openEntry !== null && canManage) {
    body = (
      <GroupKindPage
        entry={openEntry}
        highlight={highlightedKey === toLandingKey('group-kind', openEntry.groupKindId)}
      />
    );
  } else if (openEntry !== null) {
    body = <AccessDenied message={DENIED_MESSAGE} />;
  } else if (groups.data === undefined && groups.isLoading) {
    body = (
      <KkPanel variant="block">
        <KkSkeletonBlock lines={SKELETON_LINES} />
      </KkPanel>
    );
  } else {
    body = <KkEmptyState title={NOT_FOUND_TITLE} description={NOT_FOUND_DESCRIPTION} />;
  }

  return (
    <KkScreen kind="detail" title={title} origin={MANAGE_GROUPS_ORIGIN}>
      {body}
    </KkScreen>
  );
};
