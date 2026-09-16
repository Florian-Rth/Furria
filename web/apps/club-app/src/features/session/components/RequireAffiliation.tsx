import { KkScreen } from '@furria/ui';
import type { FC, PropsWithChildren } from 'react';
import { usePermissions } from '../hooks/use-permissions';
import { AccessDenied } from './AccessDenied';

const NOT_AFFILIATED_TITLE = 'Kein Zugang';
const NOT_AFFILIATED_MESSAGE =
  'Das Verzeichnis ist für Mitglieder, Gruppen und Rollen des FCC. Dein Konto hat noch keine Verbindung zum Verein — melde dich bei der Personenverwaltung.';

export const RequireAffiliation: FC<PropsWithChildren> = ({ children }) => {
  const { isAffiliated, isUndecided } = usePermissions();

  if (isUndecided || isAffiliated) {
    return children;
  }

  return (
    <KkScreen kind="detail" title={NOT_AFFILIATED_TITLE}>
      <AccessDenied message={NOT_AFFILIATED_MESSAGE} />
    </KkScreen>
  );
};
