import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { useGroupHubQuery } from '../api';
import { EDITOR_DENIED_MESSAGE, toEntryId, toHubId } from '../group-hub-labels';
import { GroupAdminEditor } from './GroupAdminEditor';
import { GroupEditorNotFound } from './GroupEditorNotFound';
import { GroupEditorSkeleton } from './GroupEditorSkeleton';
import { HubEditorDenied } from './HubEditorDenied';

const ROUTE_ID = '/_app/groups_/$groupId_/admins/$adminId';
const TITLE = 'Gruppen-Admin beenden';

export const GroupAdminScreen: FC = () => {
  const { groupId, adminId } = useParams({ from: ROUTE_ID });
  const id = toHubId(groupId);
  const entryId = toEntryId(adminId);
  const hub = useGroupHubQuery(id);

  if (hub.data === undefined) {
    return hub.isLoading ? <GroupEditorSkeleton /> : <GroupEditorNotFound />;
  }
  if (!hub.data.viewerMayManage) {
    return <HubEditorDenied hub={hub.data} title={TITLE} message={EDITOR_DENIED_MESSAGE} />;
  }

  const admin =
    entryId === null
      ? null
      : (hub.data.admins.find((entry) => entry.groupAdminId === entryId) ?? null);

  if (admin === null) {
    return <GroupEditorNotFound />;
  }

  return <GroupAdminEditor hub={hub.data} admin={admin} prefillPersonId={null} />;
};
