import { KkScreen, KkTitleHeader } from '@furria/ui';
import type { FC } from 'react';
import { MANAGE_ORIGIN, RequirePermission } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { useSessionRecordsQuery } from '../api';
import { MANAGE_SESSIONS_TITLE, toSessionsIntro } from '../manage-sessions-labels';
import type { SessionRecordSummary } from '../schemas';
import { ManageSessionsBody } from './ManageSessionsBody';

const NO_RECORDS: readonly SessionRecordSummary[] = [];

export const ManageSessionsPage: FC = () => {
  const today = new Date();
  const sessions = useSessionRecordsQuery();
  const records = sessions.data?.sessions ?? NO_RECORDS;
  const lead = sessions.data === undefined ? undefined : toSessionsIntro(records, today);

  return (
    <KkScreen
      kind="list"
      title={MANAGE_SESSIONS_TITLE}
      origin={MANAGE_ORIGIN}
      header={<KkTitleHeader title={MANAGE_SESSIONS_TITLE} lead={lead} />}
    >
      <RequirePermission permissionKey={PERMISSION_KEYS.clubManage}>
        <ManageSessionsBody today={today} />
      </RequirePermission>
    </KkScreen>
  );
};
