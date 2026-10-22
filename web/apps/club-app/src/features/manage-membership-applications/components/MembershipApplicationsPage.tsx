import { KkScreen } from '@furria/ui/KkScreen';
import { KkTitleHeader } from '@furria/ui/KkTitleHeader';
import type { FC } from 'react';
import { AREA_HANDOVERS, MANAGE_ORIGIN } from '@/features/session/app-sections';
import { RequirePermission } from '@/features/session/components/RequirePermission';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { APPLICATIONS_LEAD, APPLICATIONS_TITLE } from '../manage-membership-applications-labels';
import { MembershipApplicationsBody } from './MembershipApplicationsBody';

export const MembershipApplicationsPage: FC = () => (
  <KkScreen
    kind="list"
    title={APPLICATIONS_TITLE}
    origin={MANAGE_ORIGIN}
    header={<KkTitleHeader title={APPLICATIONS_TITLE} lead={APPLICATIONS_LEAD} />}
    handover={AREA_HANDOVERS.manage}
  >
    <RequirePermission permissionKey={PERMISSION_KEYS.membershipApplicationsDecide}>
      <MembershipApplicationsBody />
    </RequirePermission>
  </KkScreen>
);
