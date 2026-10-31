import { KkEmptyState } from '@furria/ui/KkEmptyState';
import type { FC } from 'react';

const NOT_FOUND_TITLE = 'NICHT GEFUNDEN';
const NOT_FOUND_DESCRIPTION = 'Diese Gruppe gibt es nicht.';

export const HubNotFound: FC = () => (
  <KkEmptyState title={NOT_FOUND_TITLE} description={NOT_FOUND_DESCRIPTION} />
);
