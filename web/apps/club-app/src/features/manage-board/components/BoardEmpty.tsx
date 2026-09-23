import { KkEmptyState } from '@furria/ui';
import type { FC } from 'react';

const EMPTY_TITLE = 'NOCH KEINE VORSTANDSFUNKTION';
const EMPTY_DESCRIPTION = 'Lege die erste Vorstandsfunktion an.';

export const BoardEmpty: FC = () => (
  <KkEmptyState title={EMPTY_TITLE} description={EMPTY_DESCRIPTION} />
);
