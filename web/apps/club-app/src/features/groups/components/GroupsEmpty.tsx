import { KkEmptyState, KkPanel } from '@furria/ui';
import type { FC } from 'react';

const EMPTY_TITLE = 'NOCH KEINE GRUPPE';
const EMPTY_DESCRIPTION = 'Gruppen werden in der Gruppenverwaltung angelegt.';

export const GroupsEmpty: FC = () => (
  <KkPanel variant="block">
    <KkEmptyState title={EMPTY_TITLE} description={EMPTY_DESCRIPTION} />
  </KkPanel>
);
