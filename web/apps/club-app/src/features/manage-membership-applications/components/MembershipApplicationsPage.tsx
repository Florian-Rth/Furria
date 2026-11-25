import { KkScreen } from '@furria/ui/KkScreen';
import { KkTitleHeader } from '@furria/ui/KkTitleHeader';
import type { FC } from 'react';
import { toScreenHelp } from '@/features/help/screen-help';
import { AREA_HANDOVERS, MANAGE_ORIGIN } from '@/features/session/app-sections';
import { RequirePermission } from '@/features/session/components/RequirePermission';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { APPLICATIONS_TITLE } from '../manage-membership-applications-labels';
import { ApplicationsHelp } from './ApplicationsHelp';
import { MembershipApplicationsBody } from './MembershipApplicationsBody';

const HELP = toScreenHelp(<ApplicationsHelp />);

export const MembershipApplicationsPage: FC = () => (
  <KkScreen
    kind="list"
    title={APPLICATIONS_TITLE}
    origin={MANAGE_ORIGIN}
    header={<KkTitleHeader title={APPLICATIONS_TITLE} />}
    handover={AREA_HANDOVERS.manage}
    help={HELP}
  >
    <RequirePermission permissionKey={PERMISSION_KEYS.membershipApplicationsDecide}>
      <MembershipApplicationsBody />
    </RequirePermission>
  </KkScreen>
);
