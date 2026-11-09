import { z } from 'zod';
import type { DomainChange } from './reads';
import { DOMAIN_CHANGES } from './reads';

export const ChangeFeedLineSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('ready') }),
  z.object({ kind: z.literal('ping') }),
  z.object({
    kind: z.literal('changes'),
    changes: z.union([z.literal('all'), z.array(z.string())]),
  }),
]);
export type ChangeFeedLine = z.infer<typeof ChangeFeedLineSchema>;

export type FeedRefresh =
  | { kind: 'none' }
  | { kind: 'everything' }
  | { kind: 'reads'; changes: readonly DomainChange[] };

const NOTHING: FeedRefresh = { kind: 'none' };
const EVERYTHING: FeedRefresh = { kind: 'everything' };

const isDomainChange = (name: string): name is DomainChange =>
  (DOMAIN_CHANGES as readonly string[]).includes(name);

export const toFeedRefresh = (line: ChangeFeedLine, isReconnect: boolean): FeedRefresh => {
  if (line.kind === 'ready') {
    return isReconnect ? EVERYTHING : NOTHING;
  }
  if (line.kind === 'ping') {
    return NOTHING;
  }
  if (line.changes === 'all') {
    return EVERYTHING;
  }

  const changes = line.changes.filter(isDomainChange);

  return changes.length === 0 ? NOTHING : { kind: 'reads', changes };
};

const FIRST_RETRY_MS = 1_000;
const LAST_RETRY_MS = 30_000;

export const retryDelayOf = (failedAttempts: number): number =>
  Math.min(LAST_RETRY_MS, FIRST_RETRY_MS * 2 ** Math.max(0, failedAttempts));
