import type { FC } from 'react';
import { usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { GroupKindEditor } from './GroupKindEditor';
import { ManageGroupsEditorDenied } from './ManageGroupsEditorDenied';

const TITLE = 'Gruppenart hinzufügen';

export const GroupKindCreateScreen: FC = () => {
  const permissions = usePermissions();

  if (!(permissions.isUndecided || permissions.has(PERMISSION_KEYS.groupsManage))) {
    return <ManageGroupsEditorDenied title={TITLE} />;
  }

  return <GroupKindEditor entry={null} />;
};
