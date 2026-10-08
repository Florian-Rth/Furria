import type { KkScreenActionBar } from '@furria/ui';
import { KkScreen, KkScreenHeaderSkeleton } from '@furria/ui';
import { useNavigate, useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { AREA_HANDOVERS, RequirePermission } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { parsePositiveId } from '@/lib/positive-id';
import { ADMIT_LABEL, toCandidatesContext } from '../admission-labels';
import { useMembershipApplicationQuery } from '../api';
import { APPLICATIONS_ORIGIN, toApplicationTitle } from '../manage-membership-applications-labels';
import { MembershipApplicationBody } from './MembershipApplicationBody';
import { MembershipApplicationHeader } from './MembershipApplicationHeader';

const APPLICATION_ROUTE_ID = '/_app/manage/applications_/$membershipApplicationId';
const ADMISSION_ROUTE = '/manage/applications/$membershipApplicationId/admission';

export const MembershipApplicationPage: FC = () => {
  const { membershipApplicationId } = useParams({ from: APPLICATION_ROUTE_ID });
  const id = parsePositiveId(membershipApplicationId);
  const application = useMembershipApplicationQuery(id);
  const title = toApplicationTitle(application.data);
  const hasFailed = id === null || application.error !== null;
  const navigate = useNavigate();

  const openAdmission = (): void => {
    void navigate({ to: ADMISSION_ROUTE, params: { membershipApplicationId } });
  };

  const action: KkScreenActionBar | undefined =
    application.data === undefined
      ? undefined
      : {
          context: toCandidatesContext(application.data),
          primary: { label: ADMIT_LABEL, onSelect: openAdmission },
        };

  const pendingHeader = hasFailed ? null : <KkScreenHeaderSkeleton />;
  const header =
    application.data === undefined ? (
      pendingHeader
    ) : (
      <MembershipApplicationHeader application={application.data} />
    );

  return (
    <KkScreen
      kind="working"
      title={title}
      origin={APPLICATIONS_ORIGIN}
      header={header}
      action={action}
      handover={AREA_HANDOVERS.manage}
    >
      <RequirePermission permissionKey={PERMISSION_KEYS.membershipApplicationsDecide}>
        <MembershipApplicationBody membershipApplicationId={id} />
      </RequirePermission>
    </KkScreen>
  );
};
