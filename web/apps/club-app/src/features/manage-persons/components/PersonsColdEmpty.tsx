import { KkEmptyState } from '@furria/ui/KkEmptyState';
import type { FC } from 'react';

const COLD_EMPTY_TITLE = 'NOCH KEINE PERSON';
const COLD_EMPTY_DESCRIPTION = 'Lege die erste Person an. Nur der Name ist Pflicht.';

export const PersonsColdEmpty: FC = () => (
  <KkEmptyState title={COLD_EMPTY_TITLE} description={COLD_EMPTY_DESCRIPTION} />
);
