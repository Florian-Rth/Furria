import { DEFAULT_RETURN_TO } from '@/lib/return-to';

export const LOGIN_PATH = '/login';

export interface LoginSearch {
  returnTo?: string;
  expired?: 1;
}

export const buildLoginSearch = (returnTo: string, expired: boolean): LoginSearch => {
  const search: LoginSearch = {};

  if (returnTo !== DEFAULT_RETURN_TO) {
    search.returnTo = returnTo;
  }
  if (expired) {
    search.expired = 1;
  }

  return search;
};
