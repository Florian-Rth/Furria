import { KkCard } from '@furria/ui';
import type { FC } from 'react';
import type { Membership } from '@/lib/api/schemas';
import { OverviewCard } from './OverviewCard';
import { OverviewMembershipFields } from './OverviewMembershipFields';

interface OverviewMembershipCardProps {
  membership: Membership | null;
}

export const OverviewMembershipCard: FC<OverviewMembershipCardProps> = ({ membership }) => {
  const body =
    membership === null ? (
      <KkCard.Text>Keine Mitgliedschaft hinterlegt.</KkCard.Text>
    ) : (
      <OverviewMembershipFields membership={membership} />
    );

  return <OverviewCard title="Mitgliedschaft">{body}</OverviewCard>;
};
