import { apiFailureOf } from '@furria/api-client';

export type SessionStall = 'throttled' | 'unreachable';

export const sessionStallOf = (error: Error | null): SessionStall =>
  apiFailureOf(error)?.kind === 'throttled' ? 'throttled' : 'unreachable';
