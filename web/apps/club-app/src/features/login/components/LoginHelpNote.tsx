import { KkNote } from '@furria/ui';
import type { FC } from 'react';

const HELP_LINE = 'Einladungs-Code oder Passwort vergessen? Melde dich bei der Geschäftsführung.';

export const LoginHelpNote: FC = () => (
  <KkNote tone="info" icon="info">
    {HELP_LINE}
  </KkNote>
);
