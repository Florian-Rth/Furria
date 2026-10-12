import { useQuery } from '@tanstack/react-query';
import type { ZodType } from 'zod';
import { apiFetch } from '@/lib/api/api-fetch';
import { queryClient } from '@/lib/query-client';
import type { DetailAddress } from './detail-address';
import type { PublicSource } from './public-source';
import { resolvePublicSource } from './public-source';

export interface PublicRead<TData> {
  key: readonly [string];
  useSource: () => PublicSource<TData>;
  ensure: () => Promise<TData>;
}

export interface PublicDetailRead<TDetail extends TItem, TItem> {
  readDetailKey: (slug: string) => string | null;
  slugOf: (item: TItem) => string;
  ensureDetail: (detailKey: string) => Promise<TDetail>;
}

interface PublicReadConfig<TData> {
  key: string;
  read: () => Promise<TData>;
}

interface PublicResourceConfig<TResponse, TData> {
  path: string;
  schema: ZodType<TResponse>;
  key: string;
  select: (response: TResponse) => TData;
}

interface PublicDetailConfig<TDetail extends TItem, TItem> {
  schema: ZodType<TDetail>;
  address: DetailAddress<TItem>;
}

interface PublicDetailResourceConfig<TResponse, TData, TDetail extends TItem, TItem>
  extends PublicResourceConfig<TResponse, TData> {
  detail: PublicDetailConfig<TDetail, TItem>;
}

export const definePublicRead = <TData>({
  key,
  read,
}: PublicReadConfig<TData>): PublicRead<TData> => {
  const queryKey = [key] as const;
  const options = { queryKey, queryFn: read };

  return {
    key: queryKey,
    useSource: (): PublicSource<TData> => {
      const { data, isError, refetch } = useQuery(options);

      const retry = (): void => {
        void refetch();
      };

      return resolvePublicSource(data, isError, retry);
    },
    ensure: (): Promise<TData> => queryClient.ensureQueryData(options),
  };
};

export const definePublicResource = <TResponse, TData>({
  path,
  schema,
  key,
  select,
}: PublicResourceConfig<TResponse, TData>): PublicRead<TData> =>
  definePublicRead({
    key,
    read: async (): Promise<TData> => select(await apiFetch(path, { schema })),
  });

export const definePublicDetailResource = <TResponse, TData, TDetail extends TItem, TItem>({
  detail,
  ...config
}: PublicDetailResourceConfig<TResponse, TData, TDetail, TItem>): PublicRead<TData> &
  PublicDetailRead<TDetail, TItem> => ({
  ...definePublicResource(config),
  readDetailKey: detail.address.readKey,
  slugOf: detail.address.slugOf,
  ensureDetail: (detailKey: string): Promise<TDetail> =>
    queryClient.ensureQueryData({
      queryKey: [config.key, detailKey],
      queryFn: (): Promise<TDetail> =>
        apiFetch(`${config.path}/${encodeURIComponent(detailKey)}`, { schema: detail.schema }),
    }),
});
