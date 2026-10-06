import { KkChip, KkPersonRow } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toInitials } from '@/lib/initials';
import {
  MINOR_CHIP,
  toApplicantName,
  toApplicationRowMeta,
} from '../manage-membership-applications-labels';
import type { MembershipApplicationSummary } from '../schemas';

const APPLICATION_ROUTE = '/manage/applications/$membershipApplicationId';

interface MembershipApplicationRowProps {
  application: MembershipApplicationSummary;
  now: Date;
}

export const MembershipApplicationRow: FC<MembershipApplicationRowProps> = ({
  application,
  now,
}) => {
  const initials = toInitials(application.firstName, application.lastName);
  const name = toApplicantName(application);
  const meta = toApplicationRowMeta(application, now);
  const params = { membershipApplicationId: String(application.membershipApplicationId) };
  const minorChip = application.isMinor ? (
    <KkChip tone={MINOR_CHIP.tone} dot={MINOR_CHIP.dot} size="small">
      {MINOR_CHIP.label}
    </KkChip>
  ) : null;

  return (
    <KkPersonRow
      initials={initials}
      name={name}
      meta={meta}
      trailing={minorChip}
      component={Link}
      to={APPLICATION_ROUTE}
      params={params}
    />
  );
};
