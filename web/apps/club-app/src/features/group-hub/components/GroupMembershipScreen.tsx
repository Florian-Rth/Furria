import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { parsePositiveId } from '@/lib/positive-id';
import { useLastSeen } from '@/lib/use-last-seen';
import { useGroupHubQuery } from '../api';
import { EDITOR_DENIED_MESSAGE } from '../group-hub-labels';
import { managedEntryOf } from '../managed-entry';
import { GroupEditorNotFound } from './GroupEditorNotFound';
import { GroupEditorUnloaded } from './GroupEditorUnloaded';
import { GroupMembershipEditor } from './GroupMembershipEditor';
import { HubEditorDenied } from './HubEditorDenied';

const ROUTE_ID = '/_app/groups_/$groupId_/memberships/$membershipId';
const TITLE = 'Zugehörigkeit beenden';

export const GroupMembershipScreen: FC = () => {
  const { groupId, membershipId } = useParams({ from: ROUTE_ID });
  const id = parsePositiveId(groupId);
  const entryId = parsePositiveId(membershipId);
  const hub = useGroupHubQuery(id);
  const held = useLastSeen(
    hub.data,
    managedEntryOf(
      (data) => data.members.find((member) => member.groupMembershipId === entryId) ?? null,
    ),
  );

  if (held !== null) {
    return (
      <GroupMembershipEditor hub={held.source} membership={held.entry} prefillPersonId={null} />
    );
  }
  if (hub.data === undefined) {
    return <GroupEditorUnloaded groupId={id} />;
  }
  if (!hub.data.viewerMayManage) {
    return <HubEditorDenied hub={hub.data} title={TITLE} message={EDITOR_DENIED_MESSAGE} />;
  }

  return <GroupEditorNotFound />;
};
