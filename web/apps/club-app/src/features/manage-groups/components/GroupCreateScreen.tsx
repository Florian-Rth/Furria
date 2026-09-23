import type { FC } from 'react';
import { useGroupKindsQuery } from '@/features/group-kinds';
import { usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { toGroupKindsErrorMessage } from '../manage-groups-messages';
import { GroupCreateEditor } from './GroupCreateEditor';
import { ManageGroupsEditorDenied } from './ManageGroupsEditorDenied';
import { ManageGroupsEditorError } from './ManageGroupsEditorError';
import { ManageGroupsEditorSkeleton } from './ManageGroupsEditorSkeleton';

const TITLE = 'Gruppe hinzufügen';

export const GroupCreateScreen: FC = () => {
  const permissions = usePermissions();
  const kinds = useGroupKindsQuery();
  const errorMessage = toGroupKindsErrorMessage(kinds.error);

  const reload = (): void => {
    void kinds.refetch();
  };

  if (!(permissions.isUndecided || permissions.has(PERMISSION_KEYS.groupsManage))) {
    return <ManageGroupsEditorDenied title={TITLE} />;
  }
  if (kinds.data !== undefined && !permissions.isUndecided) {
    return <GroupCreateEditor kinds={kinds.data.kinds} />;
  }
  if (errorMessage !== null) {
    return <ManageGroupsEditorError title={TITLE} message={errorMessage} onRetry={reload} />;
  }

  return <ManageGroupsEditorSkeleton title={TITLE} />;
};
