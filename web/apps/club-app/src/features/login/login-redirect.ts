import { toReturnToParam } from '@/lib/return-to';
import type { LoginSearch } from './schemas';
import { EXPIRED_FLAG } from './schemas';

export const buildLoginSearch = (returnTo: string | undefined, expired: boolean): LoginSearch => {
  const search: LoginSearch = {};
  const target = toReturnToParam(returnTo);

  if (target !== undefined) {
    search.returnTo = target;
  }
  if (expired) {
    search.expired = EXPIRED_FLAG;
  }

  return search;
};
