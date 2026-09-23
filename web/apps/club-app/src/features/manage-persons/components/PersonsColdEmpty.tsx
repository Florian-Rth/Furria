import { KkEmptyState } from '@furria/ui';
import type { FC } from 'react';

const COLD_EMPTY_TITLE = 'NOCH KEINE PERSON';
const COLD_EMPTY_DESCRIPTION = 'Leg die erste Person an — Name genügt, alles andere kommt später.';

export const PersonsColdEmpty: FC = () => (
  <KkEmptyState title={COLD_EMPTY_TITLE} description={COLD_EMPTY_DESCRIPTION} />
);
