import type { FC } from 'react';
import { useMembershipApplicationQuery } from '../api';
import { MembershipApplicationHold } from './MembershipApplicationHold';
import { MembershipApplicationView } from './MembershipApplicationView';

interface MembershipApplicationBodyProps {
  membershipApplicationId: number | null;
}

export const MembershipApplicationBody: FC<MembershipApplicationBodyProps> = ({
  membershipApplicationId,
}) => {
  const application = useMembershipApplicationQuery(membershipApplicationId);

  if (application.data !== undefined) {
    return <MembershipApplicationView application={application.data} />;
  }

  return <MembershipApplicationHold membershipApplicationId={membershipApplicationId} />;
};
