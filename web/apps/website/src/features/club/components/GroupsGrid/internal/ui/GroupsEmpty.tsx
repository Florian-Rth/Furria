import { KkButton, KkEmptyState } from '@furria/ui';
import type { FC } from 'react';
import { groupsLabels, groupsMailHref } from '@/features/club/groups-content';

export const GroupsEmpty: FC = () => (
  <KkEmptyState
    title={groupsLabels.emptyTitle}
    description={groupsLabels.emptyText}
    action={
      <KkButton variant="outlined" href={groupsMailHref} sx={{ mt: 1 }}>
        {groupsLabels.askCta}
      </KkButton>
    }
  />
);
