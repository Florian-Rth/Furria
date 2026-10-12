import type { KkNoticeRequest } from '@furria/ui';
import type { QueryKey } from '@tanstack/react-query';
import { MutationObserver, onlineManager, QueryClient } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ApiMutation, ApiMutationRuntime } from './api-mutation-options';
import { toApiMutationOptions } from './api-mutation-options';
import { OfflineWriteError } from './offline-write-error';
import { optimisticPatch } from './optimistic-patch';

interface Shelf {
  items: readonly string[];
}

interface PendingRequest {
  resolve: () => void;
  reject: () => void;
}

const SHELF_KEY = ['shelf'] as const;
const SHELF_DETAIL_KEY = ['shelf', 'detail'] as const;
const HUB_KEY = ['hub'] as const;
const NEWS_KEY = ['news'] as const;

const shelving = optimisticPatch<Shelf, string>(SHELF_KEY, (current, item) =>
  current === undefined ? undefined : { items: [...current.items, item] },
);

const createHarness = () => {
  const queryClient = new QueryClient();
  const notices: KkNoticeRequest[] = [];
  const pending: PendingRequest[] = [];
  const runtime: ApiMutationRuntime = {
    queryClient,
    raiseNotice: (notice) => {
      notices.push(notice);
    },
    authorize: (call) => call('token'),
  };
  const definition: ApiMutation<string, void> = {
    request: () =>
      new Promise<void>((resolve, reject) => {
        pending.push({ resolve, reject: () => reject(new Error('refused')) });
      }),
    invalidates: [HUB_KEY],
    optimistic: [shelving],
  };

  queryClient.setQueryData<Shelf>(SHELF_KEY, { items: ['kept'] });
  queryClient.setQueryData(SHELF_DETAIL_KEY, 'detail');
  queryClient.setQueryData(HUB_KEY, 'hub');
  queryClient.setQueryData(NEWS_KEY, 'news');

  const mutate = (
    item: string,
    overrides: Partial<ApiMutation<string, void>> = {},
  ): Promise<'settled' | 'failed'> =>
    new MutationObserver(
      queryClient,
      toApiMutationOptions(runtime, { ...definition, ...overrides }),
    )
      .mutate(item)
      .then((): 'settled' => 'settled')
      .catch((): 'failed' => 'failed');

  const shelf = (): Shelf | undefined => queryClient.getQueryData<Shelf>(SHELF_KEY);
  const isInvalidated = (key: QueryKey): boolean | undefined =>
    queryClient.getQueryState(key)?.isInvalidated;
  const requestAt = async (index: number): Promise<PendingRequest> => {
    await vi.waitFor(() => {
      expect(pending[index]).toBeDefined();
    });
    return pending[index] as PendingRequest;
  };

  return { mutate, shelf, isInvalidated, requestAt, notices };
};

afterEach(() => {
  onlineManager.setOnline(true);
});

describe('toApiMutationOptions', () => {
  it('shows the optimistic write while the request is pending', async () => {
    const harness = createHarness();

    const settled = harness.mutate('new');
    const request = await harness.requestAt(0);

    expect(harness.shelf()).toEqual({ items: ['kept', 'new'] });
    request.resolve();
    await settled;
    expect(harness.shelf()).toEqual({ items: ['kept', 'new'] });
  });

  it('rolls the optimistic write back when the request fails', async () => {
    const harness = createHarness();

    const settled = harness.mutate('new');
    (await harness.requestAt(0)).reject();

    expect(await settled).toBe('failed');
    expect(harness.shelf()).toEqual({ items: ['kept'] });
  });

  it('keeps concurrent writes until the last settles, then drops only the failed ones', async () => {
    const harness = createHarness();

    const first = harness.mutate('first');
    const second = harness.mutate('second');
    (await harness.requestAt(0)).reject();
    await first;

    expect(harness.shelf()).toEqual({ items: ['kept', 'first', 'second'] });
    expect(harness.isInvalidated(SHELF_KEY)).toBe(false);

    (await harness.requestAt(1)).resolve();
    await second;

    expect(harness.shelf()).toEqual({ items: ['kept', 'second'] });
    expect(harness.isInvalidated(SHELF_KEY)).toBe(true);
  });

  it.each([
    { outcome: 'success', settle: (request: PendingRequest) => request.resolve() },
    { outcome: 'failure', settle: (request: PendingRequest) => request.reject() },
  ])(
    'invalidates exactly the declared and optimistic scopes after a $outcome',
    async ({ settle }) => {
      const harness = createHarness();

      const settled = harness.mutate('new');
      settle(await harness.requestAt(0));
      await settled;

      expect({
        shelf: harness.isInvalidated(SHELF_KEY),
        shelfDetail: harness.isInvalidated(SHELF_DETAIL_KEY),
        hub: harness.isInvalidated(HUB_KEY),
        news: harness.isInvalidated(NEWS_KEY),
      }).toEqual({ shelf: true, shelfDetail: true, hub: true, news: false });
    },
  );

  it.each([
    { outcome: 'success', settle: (request: PendingRequest) => request.resolve(), tone: 'success' },
    { outcome: 'failure', settle: (request: PendingRequest) => request.reject(), tone: 'error' },
  ])('raises the $outcome notice with its tone', async ({ settle, tone }) => {
    const harness = createHarness();

    const settled = harness.mutate('new', {
      notice: { success: (item) => item, failure: (_error, item) => item },
    });
    settle(await harness.requestAt(0));
    await settled;

    expect(harness.notices).toEqual([{ tone, message: 'new' }]);
  });

  it('raises no notice when the failure maps to none', async () => {
    const harness = createHarness();

    const settled = harness.mutate('new', { notice: { failure: () => null } });
    (await harness.requestAt(0)).reject();
    await settled;

    expect(harness.notices).toEqual([]);
  });

  it('fails an offline-failing write at once without an optimistic write', async () => {
    const harness = createHarness();
    onlineManager.setOnline(false);
    let failure: Error | null = null;

    await harness.mutate('new', {
      offline: 'fail',
      notice: {
        failure: (error) => {
          failure = error;
          return null;
        },
      },
    });

    expect(failure).toBeInstanceOf(OfflineWriteError);
    expect(harness.shelf()).toEqual({ items: ['kept'] });
  });
});
