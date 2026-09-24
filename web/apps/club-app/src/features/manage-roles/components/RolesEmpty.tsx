import { KkEmptyState } from '@furria/ui';
import type { FC } from 'react';

const EMPTY_TITLE = 'NOCH KEINE ROLLE';
const EMPTY_DESCRIPTION = 'Lege die erste Rolle an.';

export const RolesEmpty: FC = () => (
  <KkEmptyState title={EMPTY_TITLE} description={EMPTY_DESCRIPTION} />
);
