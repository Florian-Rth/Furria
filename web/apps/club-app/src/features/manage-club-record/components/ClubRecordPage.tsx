import { KkScreen, KkTitleHeader } from '@furria/ui';
import type { FC } from 'react';
import { AREA_HANDOVERS, RequirePermission } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { CLUB_RECORD_LEAD, CLUB_RECORD_TITLE, MANAGE_ORIGIN } from '../club-record-labels';
import { ClubRecordBody } from './ClubRecordBody';

const header = <KkTitleHeader title={CLUB_RECORD_TITLE} lead={CLUB_RECORD_LEAD} />;

export const ClubRecordPage: FC = () => (
  <KkScreen
    kind="working"
    title={CLUB_RECORD_TITLE}
    origin={MANAGE_ORIGIN}
    header={header}
    handover={AREA_HANDOVERS.manage}
  >
    <RequirePermission permissionKey={PERMISSION_KEYS.clubManage}>
      <ClubRecordBody />
    </RequirePermission>
  </KkScreen>
);
