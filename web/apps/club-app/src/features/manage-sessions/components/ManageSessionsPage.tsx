import type { KkLoudScreenAction } from '@furria/ui';
import { KkScreen, KkTitleHeader } from '@furria/ui';
import type { FC } from 'react';
import { MANAGE_ORIGIN, RequirePermission, usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { useSessionRecordsQuery } from '../api';
import { useSessionDialogs } from '../hooks/use-session-dialogs';
import {
  MANAGE_SESSIONS_CREATE_LABEL,
  MANAGE_SESSIONS_TITLE,
  toSessionsIntro,
} from '../manage-sessions-labels';
import type { SessionRecordSummary } from '../schemas';
import { DeleteSessionRecordDialog } from './DeleteSessionRecordDialog';
import { ManageSessionsBody } from './ManageSessionsBody';
import { SessionRecordFormDialog } from './SessionRecordFormDialog';

const NO_RECORDS: readonly SessionRecordSummary[] = [];

export const ManageSessionsPage: FC = () => {
  const today = new Date();
  const sessions = useSessionRecordsQuery();
  const records = sessions.data?.sessions ?? NO_RECORDS;
  const dialogs = useSessionDialogs();
  const { has } = usePermissions();
  const canManage = has(PERMISSION_KEYS.clubManage);
  const lead = sessions.data === undefined ? undefined : toSessionsIntro(records, today);
  const isFormOpen = dialogs.open === 'create' || dialogs.open === 'edit';

  const createAction: KkLoudScreenAction = {
    id: 'create-session-record',
    label: MANAGE_SESSIONS_CREATE_LABEL,
    icon: 'add',
    emphasis: true,
    onSelect: dialogs.openCreate,
  };

  const actions: readonly [KkLoudScreenAction] | undefined = canManage ? [createAction] : undefined;

  return (
    <KkScreen
      kind="list"
      actions={actions}
      title={MANAGE_SESSIONS_TITLE}
      origin={MANAGE_ORIGIN}
      header={<KkTitleHeader title={MANAGE_SESSIONS_TITLE} lead={lead} />}
    >
      <RequirePermission permissionKey={PERMISSION_KEYS.clubManage}>
        <ManageSessionsBody
          today={today}
          onCreate={dialogs.openCreate}
          onEdit={dialogs.openEdit}
          onDelete={dialogs.openDelete}
        />
        <SessionRecordFormDialog
          record={dialogs.record}
          open={isFormOpen}
          onClose={dialogs.close}
          onSaved={dialogs.close}
        />
        <DeleteSessionRecordDialog
          record={dialogs.record}
          open={dialogs.open === 'delete'}
          onClose={dialogs.close}
        />
      </RequirePermission>
    </KkScreen>
  );
};
