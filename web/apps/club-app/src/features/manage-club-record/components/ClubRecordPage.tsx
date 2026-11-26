import { KkScreen } from '@furria/ui/KkScreen';
import { KkTitleHeader } from '@furria/ui/KkTitleHeader';
import type { FC } from 'react';
import { toScreenHelp } from '@/features/help/screen-help';
import { AREA_HANDOVERS } from '@/features/session/app-sections';
import { RequirePermission } from '@/features/session/components/RequirePermission';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { CLUB_RECORD_TITLE, MANAGE_ORIGIN } from '../club-record-labels';
import { ClubRecordBody } from './ClubRecordBody';
import { ClubRecordHelp } from './ClubRecordHelp';

const header = <KkTitleHeader title={CLUB_RECORD_TITLE} />;
const help = toScreenHelp(<ClubRecordHelp />);

export const ClubRecordPage: FC = () => (
  <KkScreen
    kind="working"
    title={CLUB_RECORD_TITLE}
    origin={MANAGE_ORIGIN}
    header={header}
    handover={AREA_HANDOVERS.manage}
    help={help}
  >
    <RequirePermission permissionKey={PERMISSION_KEYS.clubManage}>
      <ClubRecordBody />
    </RequirePermission>
  </KkScreen>
);
