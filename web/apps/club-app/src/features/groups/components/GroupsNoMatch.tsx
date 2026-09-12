import { KkEmptyState, KkPanel } from '@furria/ui';
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
