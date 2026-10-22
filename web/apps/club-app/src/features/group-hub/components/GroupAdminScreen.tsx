import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { useMeQuery } from '@/features/session/api';
import { parsePositiveId } from '@/lib/positive-id';
import { useLastSeen } from '@/lib/use-last-seen';
import { useGroupHubQuery } from '../api';
import { EDITOR_DENIED_MESSAGE } from '../group-hub-labels';
import { managedEntryOf } from '../managed-entry';
import { GroupAdminEditor } from './GroupAdminEditor';
import { GroupEditorNotFound } from './GroupEditorNotFound';
import { GroupEditorSkeleton } from './GroupEditorSkeleton';
import { GroupEditorUnloaded } from './GroupEditorUnloaded';
import { HubEditorDenied } from './HubEditorDenied';

const ROUTE_ID = '/_app/groups_/$groupId_/admins/$adminId';
const TITLE = 'Gruppen-Admin beenden';

export const GroupAdminScreen: FC = () => {
  const { groupId, adminId } = useParams({ from: ROUTE_ID });
  const id = parsePositiveId(groupId);
  const entryId = parsePositiveId(adminId);
  const hub = useGroupHubQuery(id);
  const me = useMeQuery();
  const held = useLastSeen(
    hub.data,
    managedEntryOf((data) => data.admins.find((entry) => entry.groupAdminId === entryId) ?? null),
  );

  if (held !== null && me.data !== undefined) {
    return <GroupAdminEditor hub={held.source} admin={held.entry} prefillPersonId={null} />;
  }
  if (hub.data === undefined) {
    return <GroupEditorUnloaded groupId={id} />;
  }
  if (!hub.data.viewerMayManage) {
    return <HubEditorDenied hub={hub.data} title={TITLE} message={EDITOR_DENIED_MESSAGE} />;
  }
  if (held === null) {
    return <GroupEditorNotFound />;
  }

  return <GroupEditorSkeleton />;
};
