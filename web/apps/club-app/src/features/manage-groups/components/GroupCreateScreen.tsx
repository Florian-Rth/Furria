import type { FC } from 'react';
import { usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { GroupCreateEditor } from './GroupCreateEditor';
import { ManageGroupsEditorDenied } from './ManageGroupsEditorDenied';

const TITLE = 'Gruppe hinzufügen';

export const GroupCreateScreen: FC = () => {
  const permissions = usePermissions();

  if (!(permissions.isUndecided || permissions.has(PERMISSION_KEYS.groupsManage))) {
    return <ManageGroupsEditorDenied title={TITLE} />;
  }

  return <GroupCreateEditor />;
};
