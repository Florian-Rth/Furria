import { KkEmptyState } from '@furria/ui/KkEmptyState';
import { KkPanel } from '@furria/ui/KkPanel';
import type { FC } from 'react';
import { NO_GROUP_MATCH_TITLE } from '../groups-labels';

interface GroupsNoMatchProps {
  description: string;
}

export const GroupsNoMatch: FC<GroupsNoMatchProps> = ({ description }) => (
  <KkPanel variant="block">
    <KkEmptyState title={NO_GROUP_MATCH_TITLE} description={description} />
  </KkPanel>
);
