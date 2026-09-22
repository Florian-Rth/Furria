import { useParams, useSearch } from '@tanstack/react-router';
import type { FC } from 'react';
import { useGroupHubQuery } from '../api';
import { EDITOR_DENIED_MESSAGE, toHubId, toPersonIdParam } from '../group-hub-labels';
import { GroupEditorNotFound } from './GroupEditorNotFound';
import { GroupEditorSkeleton } from './GroupEditorSkeleton';
import { GroupMembershipEditor } from './GroupMembershipEditor';
import { HubEditorDenied } from './HubEditorDenied';

const ROUTE_ID = '/_app/groups_/$groupId_/memberships/new';
const TITLE = 'Mitglied aufnehmen';

export const GroupMembershipNewScreen: FC = () => {
  const { groupId } = useParams({ from: ROUTE_ID });
  const { person } = useSearch({ from: ROUTE_ID });
  const id = toHubId(groupId);
  const hub = useGroupHubQuery(id);

  if (hub.data === undefined) {
    return hub.isLoading ? <GroupEditorSkeleton /> : <GroupEditorNotFound />;
  }
  if (!hub.data.viewerMayManage) {
    return <HubEditorDenied hub={hub.data} title={TITLE} message={EDITOR_DENIED_MESSAGE} />;
  }

  return (
    <GroupMembershipEditor
      hub={hub.data}
      membership={null}
      prefillPersonId={toPersonIdParam(person)}
    />
  );
};
