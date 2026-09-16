import { KkEmptyState } from '@furria/ui';
import type { FC } from 'react';

const NOT_FOUND_TITLE = 'NICHT MEHR DA';
const NOT_FOUND_DESCRIPTION = 'Diese Gruppe gibt es nicht mehr.';

export const HubNotFound: FC = () => (
  <KkEmptyState title={NOT_FOUND_TITLE} description={NOT_FOUND_DESCRIPTION} />
);
