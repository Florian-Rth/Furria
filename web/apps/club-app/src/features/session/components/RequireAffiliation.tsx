import type { FC, PropsWithChildren } from 'react';
import { usePermissions } from '../hooks/use-permissions';
import { AccessDenied } from './AccessDenied';

const NOT_AFFILIATED_MESSAGE =
  'Das Verzeichnis ist für Mitglieder, Gruppen und Rollen des FCC. Dein Konto hat noch keine Verbindung zum Verein — melde dich bei der Personenverwaltung.';

export const RequireAffiliation: FC<PropsWithChildren> = ({ children }) => {
  const { isAffiliated, isPending } = usePermissions();

  if (isPending || isAffiliated) {
    return children;
  }

  return <AccessDenied message={NOT_AFFILIATED_MESSAGE} />;
};
