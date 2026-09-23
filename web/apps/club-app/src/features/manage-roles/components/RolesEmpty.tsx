import { KkEmptyState } from '@furria/ui';
import type { FC } from 'react';

const EMPTY_TITLE = 'NOCH KEINE ROLLE';
const EMPTY_DESCRIPTION =
  'Eine Rolle bündelt Aufgaben und Rechte. Leg die erste an — die Rechte setzt du danach.';

export const RolesEmpty: FC = () => (
  <KkEmptyState title={EMPTY_TITLE} description={EMPTY_DESCRIPTION} />
);
