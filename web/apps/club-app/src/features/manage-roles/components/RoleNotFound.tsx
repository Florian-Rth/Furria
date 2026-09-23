import { KkEmptyState, KkPanel } from '@furria/ui';
import type { FC } from 'react';

const TITLE = 'DIESE ROLLE GIBT ES NICHT';
const DESCRIPTION = 'Sie wurde gelöscht oder der Link ist veraltet.';

export const RoleNotFound: FC = () => (
  <KkPanel variant="block">
    <KkEmptyState title={TITLE} description={DESCRIPTION} />
  </KkPanel>
);
