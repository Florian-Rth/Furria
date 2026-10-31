import { useMyActsQuery } from '@/features/acts/api';
import { usePermissions } from './use-permissions';

export interface DeniedEscapesState {
  showsMyActs: boolean;
}

export const useDeniedEscapes = (): DeniedEscapesState => {
  const { isManagingLogin, isUndecided } = usePermissions();
  const myActs = useMyActsQuery(!isUndecided && !isManagingLogin);

  return { showsMyActs: (myActs.data?.acts.length ?? 0) > 0 };
};
