import { usePendingAnswers } from '@/features/attendance';
import { useMeQuery, usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { useMinuteNow } from '@/lib/use-minute-now';
import { useStartQuery } from '../api';
import type { Start } from '../schemas';
import { withPendingAnswers } from '../start-answer';
import { startScreenOf, withoutQuiet } from '../start-board';
import { toStartErrorMessage } from '../start-messages';
import { useQuietMemory } from './use-quiet-memory';
import { useReshapeRefetch } from './use-reshape-refetch';
import { useSkeletonDelay } from './use-skeleton-delay';
import { useStartVisit } from './use-start-visit';
import { useStraySheet } from './use-stray-sheet';

export interface StartBoard {
  start: Start;
  dimmedKeys: ReadonlySet<string>;
  now: Date;
  canReadClub: boolean;
  memberSince: string | null;
  lastSeenAnnouncementAt: string | null | undefined;
  touch: (key: string) => void;
  quiet: (key: string, until: string) => void;
}

export type StartView =
  | { screen: 'waiting' | 'skeleton' | 'inactive' | 'empty' }
  | { screen: 'error'; message: string; retry: () => void; retrying: boolean }
  | { screen: 'board'; board: StartBoard };

const NO_DIMMED_KEYS: ReadonlySet<string> = new Set();

export const useStartView = (): StartView => {
  const query = useStartQuery();
  const me = useMeQuery();
  const permissions = usePermissions();
  const now = useMinuteNow();
  const { visit, touched, touch } = useStartVisit(query.data);
  const personId = me.data?.person?.id ?? null;
  const { memory, quiet } = useQuietMemory(personId);
  const pendingAnswers = usePendingAnswers();
  const ready = visit !== null && me.data !== undefined;
  const errorMessage = visit === null ? toStartErrorMessage(query.error) : null;
  const skeletonDue = useSkeletonDelay(!ready && errorMessage === null);
  const start = ready
    ? withPendingAnswers(withoutQuiet(visit.start, memory, touched), pendingAnswers)
    : null;

  const refetch = (): void => {
    void query.refetch();
  };

  useReshapeRefetch(query.data?.reshapeAt ?? null, refetch);
  useStraySheet(start);

  const screen = startScreenOf({ start, failed: errorMessage !== null, skeletonDue });

  if (screen.kind === 'board') {
    return {
      screen: screen.kind,
      board: {
        start: screen.start,
        dimmedKeys: visit?.dimmedKeys ?? NO_DIMMED_KEYS,
        now,
        canReadClub: permissions.has(PERMISSION_KEYS.clubRead),
        memberSince: me.data?.membership.memberSince ?? null,
        lastSeenAnnouncementAt: me.data?.lastSeenAnnouncementAt,
        touch,
        quiet,
      },
    };
  }
  if (screen.kind === 'error') {
    return {
      screen: screen.kind,
      message: errorMessage ?? '',
      retry: refetch,
      retrying: query.isFetching,
    };
  }

  return { screen: screen.kind };
};
