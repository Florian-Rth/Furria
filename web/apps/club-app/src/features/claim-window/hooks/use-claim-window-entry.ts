import { usePermissions } from '@/features/session/hooks/use-permissions';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { useClaimWindowOverviewQuery } from '../api';
import { toWindowOpenState, WINDOW_CLOSED_STATE } from '../claim-window-copy';
import { formatWindowMoment } from '../claim-window-format';

export interface ClaimWindowEntry {
  isShown: boolean;
  meta: string | undefined;
  isOpen: boolean;
}

export const useClaimWindowEntry = (): ClaimWindowEntry => {
  const isShown = usePermissions().has(PERMISSION_KEYS.claimWindowManage);
  const query = useClaimWindowOverviewQuery(isShown);
  const closesAt = query.data?.window?.closesAt;

  if (query.data === undefined) {
    return { isShown, meta: undefined, isOpen: false };
  }

  return closesAt === undefined
    ? { isShown, meta: WINDOW_CLOSED_STATE, isOpen: false }
    : { isShown, meta: toWindowOpenState(formatWindowMoment(closesAt)), isOpen: true };
};
