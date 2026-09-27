import { KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { AREA_HANDOVERS, RequirePermission } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { CLUB_RECORD_TITLE, MANAGE_ORIGIN } from '../club-record-labels';
import { ClubRecordBody } from './ClubRecordBody';

export const ClubRecordPage: FC = () => (
  <KkScreen
    kind="working"
    title={CLUB_RECORD_TITLE}
    origin={MANAGE_ORIGIN}
    handover={AREA_HANDOVERS.manage}
  >
    <RequirePermission permissionKey={PERMISSION_KEYS.clubManage}>
      <ClubRecordBody />
    </RequirePermission>
  </KkScreen>
);
