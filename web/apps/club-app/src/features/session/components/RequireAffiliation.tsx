import type { FC, PropsWithChildren } from 'react';
import { CLUB_ORIGIN } from '../app-sections';
import { usePermissions } from '../hooks/use-permissions';
import { AccessDeniedScreen } from './AccessDeniedScreen';

const NOT_AFFILIATED_TITLE = 'Kein Zugang';
const NOT_AFFILIATED_MESSAGE =
  'Das Verzeichnis ist für Mitglieder, Gruppen und Rollen des FCC. Dein Konto hat noch keine Verbindung zum Verein — melde dich bei der Personenverwaltung.';

export const RequireAffiliation: FC<PropsWithChildren> = ({ children }) => {
  const { isAffiliated, isUndecided } = usePermissions();

  if (isUndecided || isAffiliated) {
    return children;
  }

  return (
    <AccessDeniedScreen
      title={NOT_AFFILIATED_TITLE}
      origin={CLUB_ORIGIN}
      message={NOT_AFFILIATED_MESSAGE}
    />
  );
};
