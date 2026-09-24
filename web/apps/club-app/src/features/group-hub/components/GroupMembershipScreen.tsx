import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { useGroupHubQuery } from '../api';
import { EDITOR_DENIED_MESSAGE, toEntryId, toHubId } from '../group-hub-labels';
import { GroupEditorNotFound } from './GroupEditorNotFound';
import { GroupEditorUnloaded } from './GroupEditorUnloaded';
import { GroupMembershipEditor } from './GroupMembershipEditor';
import { HubEditorDenied } from './HubEditorDenied';

const ROUTE_ID = '/_app/groups_/$groupId_/memberships/$membershipId';
const TITLE = 'Zugehörigkeit beenden';

export const GroupMembershipScreen: FC = () => {
  const { groupId, membershipId } = useParams({ from: ROUTE_ID });
  const id = toHubId(groupId);
  const entryId = toEntryId(membershipId);
  const hub = useGroupHubQuery(id);

  if (hub.data === undefined) {
    return <GroupEditorUnloaded groupId={id} />;
  }
  if (!hub.data.viewerMayManage) {
    return <HubEditorDenied hub={hub.data} title={TITLE} message={EDITOR_DENIED_MESSAGE} />;
  }

  const membership =
    entryId === null
      ? null
      : (hub.data.members.find((member) => member.groupMembershipId === entryId) ?? null);

  if (membership === null) {
    return <GroupEditorNotFound />;
  }

  return <GroupMembershipEditor hub={hub.data} membership={membership} prefillPersonId={null} />;
};
