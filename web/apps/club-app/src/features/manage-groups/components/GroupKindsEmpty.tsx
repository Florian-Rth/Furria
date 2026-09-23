import { KkEmptyState } from '@furria/ui';
import type { FC } from 'react';
import { GROUP_KINDS_EMPTY_DESCRIPTION, GROUP_KINDS_EMPTY_TITLE } from '../manage-groups-labels';

export const GroupKindsEmpty: FC = () => (
  <KkEmptyState title={GROUP_KINDS_EMPTY_TITLE} description={GROUP_KINDS_EMPTY_DESCRIPTION} />
);
