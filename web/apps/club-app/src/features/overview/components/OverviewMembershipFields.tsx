import type { FC } from 'react';
import type { Membership } from '@/lib/api/schemas';
import {
  formatMembershipPeriod,
  toMembershipStatusLabel,
  toMembershipTypeLabel,
} from '@/lib/membership-labels';
import { OverviewField } from './OverviewField';
import { OverviewFields } from './OverviewFields';

interface OverviewMembershipFieldsProps {
  membership: Membership;
}

export const OverviewMembershipFields: FC<OverviewMembershipFieldsProps> = ({ membership }) => {
  const typeLabel = toMembershipTypeLabel(membership.type);
  const statusLabel = toMembershipStatusLabel(membership.status);
  const period = formatMembershipPeriod(membership.startedAt, membership.endedAt);

  return (
    <OverviewFields>
      <OverviewField label="Art" value={typeLabel} />
      <OverviewField label="Status" value={statusLabel} />
      <OverviewField label="Zeitraum" value={period} />
    </OverviewFields>
  );
};
