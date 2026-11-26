import { usePermissions } from '@/features/session/hooks/use-permissions';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import type { BeerBookingGate } from '../booking/booking-gate';
import type { BeerListPage } from './use-beer-list-page';

export interface BeerListHelpViewer {
  gate: BeerBookingGate;
  hasHistory: boolean;
  hasEarlierPayee: boolean;
  seesGivers: boolean;
  manages: boolean;
}

export const useBeerListHelpViewer = (page: BeerListPage): BeerListHelpViewer => {
  const manages = usePermissions().has(PERMISSION_KEYS.beerListManage);

  return {
    gate: page.gate,
    hasHistory: page.load.state === 'ready' && page.history.length > 0,
    hasEarlierPayee: page.payees.some((payee) => !payee.current),
    seesGivers: page.load.state === 'ready' && page.givers !== null,
    manages,
  };
};
