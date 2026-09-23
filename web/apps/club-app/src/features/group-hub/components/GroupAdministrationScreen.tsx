import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { useGroupHubQuery } from '../api';
import { ADMINISTRATION_DENIED_MESSAGE, toHubId } from '../group-hub-labels';
import { GroupAdministrationEditor } from './GroupAdministrationEditor';
import { GroupEditorSkeleton } from './GroupEditorSkeleton';
import { GroupEditorUnloaded } from './GroupEditorUnloaded';
import { HubEditorDenied } from './HubEditorDenied';

const ROUTE_ID = '/_app/groups_/$groupId_/administration';
const TITLE = 'Name und Gruppenart bearbeiten';

export const GroupAdministrationScreen: FC = () => {
  const { groupId } = useParams({ from: ROUTE_ID });
  const id = toHubId(groupId);
  const hub = useGroupHubQuery(id);
  const permissions = usePermissions();

  if (hub.data === undefined) {
    return <GroupEditorUnloaded groupId={id} />;
  }
  if (permissions.isUndecided) {
    return <GroupEditorSkeleton />;
  }
  if (!permissions.has(PERMISSION_KEYS.groupsManage)) {
    return <HubEditorDenied hub={hub.data} title={TITLE} message={ADMINISTRATION_DENIED_MESSAGE} />;
  }

  return <GroupAdministrationEditor hub={hub.data} />;
};
