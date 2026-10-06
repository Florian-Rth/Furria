import { KkScreen } from '@furria/ui';
import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { RequirePermission } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { ADMISSION_ACTION_LABEL } from '../admission-labels';
import { useMembershipApplicationQuery } from '../api';
import {
  APPLICATIONS_ORIGIN,
  toMembershipApplicationId,
} from '../manage-membership-applications-labels';
import { AdmissionEditor } from './AdmissionEditor';
import { MembershipApplicationHold } from './MembershipApplicationHold';

const ADMISSION_ROUTE_ID = '/_app/manage/applications_/$membershipApplicationId_/admission';

export const MembershipApplicationAdmissionScreen: FC = () => {
  const { membershipApplicationId } = useParams({ from: ADMISSION_ROUTE_ID });
  const id = toMembershipApplicationId(membershipApplicationId);
  const application = useMembershipApplicationQuery(id);

  if (application.data !== undefined) {
    return <AdmissionEditor application={application.data} />;
  }

  return (
    <KkScreen kind="fullscreen" title={ADMISSION_ACTION_LABEL} origin={APPLICATIONS_ORIGIN}>
      <RequirePermission permissionKey={PERMISSION_KEYS.membershipApplicationsDecide}>
        <MembershipApplicationHold membershipApplicationId={id} />
      </RequirePermission>
    </KkScreen>
  );
};
