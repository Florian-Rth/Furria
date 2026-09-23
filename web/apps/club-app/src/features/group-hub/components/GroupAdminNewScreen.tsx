import { useParams, useSearch } from '@tanstack/react-router';
import type { FC } from 'react';
import { useGroupHubQuery } from '../api';
import { EDITOR_DENIED_MESSAGE, toHubId, toPersonIdParam } from '../group-hub-labels';
import { GroupAdminEditor } from './GroupAdminEditor';
import { GroupEditorUnloaded } from './GroupEditorUnloaded';
import { HubEditorDenied } from './HubEditorDenied';

const ROUTE_ID = '/_app/groups_/$groupId_/admins/new';
const TITLE = 'Gruppen-Admin ernennen';

export const GroupAdminNewScreen: FC = () => {
  const { groupId } = useParams({ from: ROUTE_ID });
  const { person } = useSearch({ from: ROUTE_ID });
  const id = toHubId(groupId);
  const hub = useGroupHubQuery(id);

  if (hub.data === undefined) {
    return <GroupEditorUnloaded groupId={id} />;
  }
  if (!hub.data.viewerMayManage) {
    return <HubEditorDenied hub={hub.data} title={TITLE} message={EDITOR_DENIED_MESSAGE} />;
  }

  return <GroupAdminEditor hub={hub.data} admin={null} prefillPersonId={toPersonIdParam(person)} />;
};
