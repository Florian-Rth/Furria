import { KkChip, KkFactRow } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toLandingKey } from '@/features/write';
import { toPeriodChip } from '@/lib/state-chips';
import { MEMBERSHIP_ROW_TITLE, toAdmissionMeta, toMembershipSpan } from '../manage-persons-labels';
import type { PersonMembership } from '../schemas';

const MEMBERSHIP_ROUTE = '/manage/persons/$personId/memberships/$membershipId';

interface PersonMembershipRowProps {
  personId: number;
  membership: PersonMembership;
  highlight: boolean;
}

export const PersonMembershipRow: FC<PersonMembershipRowProps> = ({
  personId,
  membership,
  highlight,
}) => {
  const periodChip = toPeriodChip(membership.isRunning, membership.isFuture);
  const span = toMembershipSpan(membership);
  const admission = toAdmissionMeta(membership.admission);
  const params = { personId: String(personId), membershipId: String(membership.membershipId) };
  const landing = toLandingKey('membership', membership.membershipId);

  const chip =
    periodChip === null ? undefined : (
      <KkChip tone={periodChip.tone} dot={periodChip.dot} size="small">
        {periodChip.label}
      </KkChip>
    );

  return (
    <KkFactRow
      title={MEMBERSHIP_ROW_TITLE}
      span={span}
      meta={admission}
      chip={chip}
      highlight={highlight}
      landing={landing}
      component={Link}
      to={MEMBERSHIP_ROUTE}
      params={params}
    />
  );
};
