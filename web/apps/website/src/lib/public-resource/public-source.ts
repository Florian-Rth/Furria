import { apiStatusOf } from '@furria/api-client';

const NOT_FOUND_STATUS = 404;

export type PublicSource<TData> =
  | { status: 'loading' }
  | { status: 'error'; retry: () => void }
  | { status: 'ready'; data: TData };

export const isMissingRead = (error: Error): boolean => apiStatusOf(error) === NOT_FOUND_STATUS;

export const resolvePublicSource = <TData>(
  data: TData | undefined,
  hasFailed: boolean,
  retry: () => void,
): PublicSource<TData> => {
  if (data !== undefined) {
    return { status: 'ready', data };
  }

  return hasFailed ? { status: 'error', retry } : { status: 'loading' };
};

export const readySourceData = <TData>(source: PublicSource<TData>): TData | undefined =>
  source.status === 'ready' ? source.data : undefined;
