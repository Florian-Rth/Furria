import { KkNote } from '@furria/ui';
import type { FC } from 'react';

const HELP_LINE = 'Passwort vergessen? Wende dich an die Personenverwaltung.';

export const LoginHelpNote: FC = () => (
  <KkNote tone="hint" icon="info">
    {HELP_LINE}
  </KkNote>
);
