import { KkEmptyState } from '@furria/ui';
import type { FC } from 'react';
import { ClubMailKkButton } from '@/components/ClubMailKkButton';
import { groupsLabels } from '@/features/club/groups-content';

export const GroupsEmpty: FC = () => (
  <KkEmptyState
    title={groupsLabels.emptyTitle}
    description={groupsLabels.emptyText}
    action={
      <ClubMailKkButton variant="outlined" sx={{ mt: 1 }}>
        {groupsLabels.askCta}
      </ClubMailKkButton>
    }
  />
);
