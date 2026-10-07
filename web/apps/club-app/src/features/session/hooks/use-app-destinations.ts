import type { KkShellDestination } from '@furria/ui';
import { APP_DESTINATIONS, MANAGING_LOGIN_DESTINATIONS } from '../app-sections';
import { usePermissions } from './use-permissions';

export const useAppDestinations = (): readonly KkShellDestination[] => {
  const { isManagingLogin } = usePermissions();

  return isManagingLogin ? MANAGING_LOGIN_DESTINATIONS : APP_DESTINATIONS;
};
