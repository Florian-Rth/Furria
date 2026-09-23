import { KkEmptyState, KkScreen } from '@furria/ui';
import { useParams } from '@tanstack/react-router';
import type { FC, ReactNode } from 'react';
import { AccessDenied, usePermissions } from '@/features/session';
import { toLandingKey, useLanding } from '@/features/write';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { useManagedGroupsQuery } from '../api';
import {
  findGroupKindEntry,
  GROUP_KIND_SECTION_TITLE,
  MANAGE_GROUPS_ORIGIN,
  toGroupKindEntries,
  toGroupKindEntryId,
} from '../manage-groups-labels';
import { toManagedGroupsErrorMessage } from '../manage-groups-messages';
import { GroupKindPage } from './GroupKindPage';
import { GroupKindSkeleton } from './GroupKindSkeleton';
import { ManagedGroupsError } from './ManagedGroupsError';

const ROUTE_ID = '/_app/manage/groups_/kinds/$groupKindId';
const NOT_FOUND_TITLE = 'NICHT MEHR DA';
const NOT_FOUND_DESCRIPTION = 'Diese Gruppenart gibt es nicht mehr.';
const DENIED_MESSAGE = 'Dir fehlt die Berechtigung für die Gruppenverwaltung.';

export const GroupKindScreen: FC = () => {
  const { groupKindId } = useParams({ from: ROUTE_ID });
  const id = toGroupKindEntryId(groupKindId);
  const groups = useManagedGroupsQuery();
  const permissions = usePermissions();
  const { highlightedKey } = useLanding();
  const errorMessage = toManagedGroupsErrorMessage(groups.error);
  const canManage = permissions.isUndecided || permissions.has(PERMISSION_KEYS.groupsManage);
  const isReady = groups.data !== undefined && !permissions.isUndecided;
  const entries = groups.data === undefined ? [] : toGroupKindEntries(groups.data.kinds);
  const entry = findGroupKindEntry(entries, id);
  const openEntry = entry !== null && !entry.isArchived ? entry : null;
  const title = entry === null ? GROUP_KIND_SECTION_TITLE : entry.name;

  const reload = (): void => {
    void groups.refetch();
  };

  let body: ReactNode;

  if (!canManage) {
    body = <AccessDenied message={DENIED_MESSAGE} />;
  } else if (isReady && openEntry !== null) {
    body = (
      <GroupKindPage
        entry={openEntry}
        highlight={highlightedKey === toLandingKey('group-kind', openEntry.groupKindId)}
      />
    );
  } else if (isReady) {
    body = <KkEmptyState title={NOT_FOUND_TITLE} description={NOT_FOUND_DESCRIPTION} />;
  } else if (groups.data === undefined && errorMessage !== null) {
    body = <ManagedGroupsError message={errorMessage} onRetry={reload} />;
  } else {
    body = <GroupKindSkeleton />;
  }

  return (
    <KkScreen kind="detail" title={title} origin={MANAGE_GROUPS_ORIGIN}>
      {body}
    </KkScreen>
  );
};
