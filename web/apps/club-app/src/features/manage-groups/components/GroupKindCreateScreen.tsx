import type { FC } from 'react';
import { usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { GroupKindEditor } from './GroupKindEditor';
import { ManageGroupsEditorDenied } from './ManageGroupsEditorDenied';
import { ManageGroupsEditorSkeleton } from './ManageGroupsEditorSkeleton';

const TITLE = 'Gruppenart hinzufügen';

export const GroupKindCreateScreen: FC = () => {
  const permissions = usePermissions();

  if (permissions.isUndecided) {
    return <ManageGroupsEditorSkeleton title={TITLE} />;
  }
  if (!permissions.has(PERMISSION_KEYS.groupsManage)) {
    return <ManageGroupsEditorDenied title={TITLE} />;
  }

  return <GroupKindEditor entry={null} />;
};
