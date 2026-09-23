import { KkEmptyState } from '@furria/ui';
import type { FC } from 'react';

const EMPTY_TITLE = 'NOCH KEINE VORSTANDSFUNKTION';
const EMPTY_DESCRIPTION =
  'Der Vorstand wird hier festgehalten, nicht erfunden. Leg die erste Funktion an — wer darin sitzt, trägst du danach ein.';

export const BoardEmpty: FC = () => (
  <KkEmptyState title={EMPTY_TITLE} description={EMPTY_DESCRIPTION} />
);
