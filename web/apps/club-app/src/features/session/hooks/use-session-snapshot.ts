import { useSyncExternalStore } from 'react';
import type { SessionSnapshot } from '@/lib/api/session/session-store';
import { getSessionSnapshot, subscribeToSession } from '@/lib/api/session/session-store';

export const useSessionSnapshot = (): SessionSnapshot =>
  useSyncExternalStore(subscribeToSession, getSessionSnapshot, getSessionSnapshot);
