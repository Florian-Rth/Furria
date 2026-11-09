import type { QueryClient } from '@tanstack/react-query';
import { apiStream } from '@/lib/api/api-fetch';
import { hasOpenPatch } from '@/lib/api/optimistic-patch';
import {
  getSessionSnapshot,
  subscribeToSession,
  withFreshAccessToken,
} from '@/lib/api/session/session-store';
import type { ChangeFeedLine, FeedRefresh } from './change-feed-lines';
import { ChangeFeedLineSchema, retryDelayOf, toFeedRefresh } from './change-feed-lines';
import { refreshAfter } from './refresh-after';

const CHANGES_PATH = '/api/changes';

let feed: AbortController | null = null;
let retryTimer: ReturnType<typeof setTimeout> | null = null;
let failedAttempts = 0;
let hasBeenReady = false;

const shouldListen = (): boolean =>
  getSessionSnapshot().status === 'authenticated' && document.visibilityState === 'visible';

const refreshEverything = (queryClient: QueryClient): Promise<void> =>
  queryClient.invalidateQueries({
    predicate: (query) => !hasOpenPatch(queryClient, query.queryKey),
  });

const apply = (queryClient: QueryClient, refresh: FeedRefresh): void => {
  if (refresh.kind === 'everything') {
    void refreshEverything(queryClient);
  }
  if (refresh.kind === 'reads') {
    void refreshAfter(queryClient, refresh.changes);
  }
};

const receive = (queryClient: QueryClient, line: ChangeFeedLine): void => {
  apply(queryClient, toFeedRefresh(line, hasBeenReady));
  if (line.kind === 'ready') {
    hasBeenReady = true;
    failedAttempts = 0;
  }
};

const stop = (): void => {
  if (retryTimer !== null) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }
  const running = feed;
  feed = null;
  running?.abort();
};

const listen = async (queryClient: QueryClient): Promise<void> => {
  const controller = new AbortController();
  feed = controller;

  try {
    await withFreshAccessToken((accessToken) =>
      apiStream(CHANGES_PATH, {
        schema: ChangeFeedLineSchema,
        accessToken,
        signal: controller.signal,
        onLine: (line) => {
          receive(queryClient, line);
        },
      }),
    );
  } catch {
    failedAttempts += 1;
  }

  if (feed === controller) {
    feed = null;
    retryLater(queryClient);
  }
};

const retryLater = (queryClient: QueryClient): void => {
  if (!shouldListen()) {
    return;
  }

  retryTimer = setTimeout(() => {
    retryTimer = null;
    sync(queryClient);
  }, retryDelayOf(failedAttempts));
};

const sync = (queryClient: QueryClient): void => {
  if (!shouldListen()) {
    stop();
    return;
  }
  if (feed === null && retryTimer === null) {
    void listen(queryClient);
  }
};

const reconnectNow = (queryClient: QueryClient): void => {
  stop();
  failedAttempts = 0;
  sync(queryClient);
};

export const startChangeFeed = (queryClient: QueryClient): void => {
  const follow = (): void => {
    sync(queryClient);
  };
  const recover = (): void => {
    reconnectNow(queryClient);
  };

  subscribeToSession(follow);
  document.addEventListener('visibilitychange', follow);
  window.addEventListener('online', recover);
  follow();
};
