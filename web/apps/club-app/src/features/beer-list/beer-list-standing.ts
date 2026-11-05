import type { PermissionKey } from '@/lib/api/schemas';
import { PERMISSION_KEYS } from '@/lib/api/schemas';

export type BeerListStanding = 'taker' | 'keeper' | 'former' | 'none';

export const beerListStandingOf = (
  keys: readonly PermissionKey[],
  hasOpenCrates: boolean,
): BeerListStanding => {
  if (keys.includes(PERMISSION_KEYS.beerListTake)) {
    return 'taker';
  }

  if (keys.includes(PERMISSION_KEYS.beerListManage)) {
    return 'keeper';
  }

  return hasOpenCrates ? 'former' : 'none';
};

export const readsWholeBeerList = (standing: BeerListStanding): boolean =>
  standing === 'taker' || standing === 'keeper';
