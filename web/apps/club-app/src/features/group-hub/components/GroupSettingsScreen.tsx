import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { usePermissions } from '@/features/session/hooks/use-permissions';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { parsePositiveId } from '@/lib/positive-id';
import { useGroupHubQuery } from '../api';
import { EDITOR_DENIED_MESSAGE, GROUP_SETTINGS_TITLE } from '../group-hub-labels';
import { GroupEditorSkeleton } from './GroupEditorSkeleton';
import { GroupEditorUnloaded } from './GroupEditorUnloaded';
import { GroupSettingsEditor } from './GroupSettingsEditor';
import { HubEditorDenied } from './HubEditorDenied';

const ROUTE_ID = '/_app/groups_/$groupId_/settings';

export const GroupSettingsScreen: FC = () => {
  const { groupId } = useParams({ from: ROUTE_ID });
  const id = parsePositiveId(groupId);
  const hub = useGroupHubQuery(id);
  const permissions = usePermissions();

  if (hub.data === undefined) {
    return <GroupEditorUnloaded groupId={id} />;
  }
  if (permissions.isUndecided) {
    return <GroupEditorSkeleton />;
  }
  if (!hub.data.viewerMayManage) {
    return (
      <HubEditorDenied
        hub={hub.data}
        title={GROUP_SETTINGS_TITLE}
        message={EDITOR_DENIED_MESSAGE}
      />
    );
  }

  return (
    <GroupSettingsEditor
      hub={hub.data}
      administers={permissions.has(PERMISSION_KEYS.groupsManage)}
    />
  );
};
