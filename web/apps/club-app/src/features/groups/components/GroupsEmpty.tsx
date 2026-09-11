import { KkEmptyState } from '@furria/ui';
import type { FC } from 'react';

const EMPTY_TITLE = 'NOCH KEINE GRUPPE';
const EMPTY_DESCRIPTION =
  'Im Verzeichnis steht gerade keine Gruppe. Angelegt werden sie in der Gruppenverwaltung.';

export const GroupsEmpty: FC = () => (
  <KkEmptyState icon="group" title={EMPTY_TITLE} description={EMPTY_DESCRIPTION} />
);
