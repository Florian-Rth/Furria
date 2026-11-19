import type { IntakeSummary } from './schemas';

export type HistoryMoment = 'created' | 'expires' | 'submitted' | 'completed' | 'discarded';

export interface HistoryLine {
  moment: HistoryMoment;
  at: string;
}

const lineOf = (moment: HistoryMoment, at: string | null): HistoryLine[] =>
  at === null ? [] : [{ moment, at }];

const linkExpiryOf = (intake: IntakeSummary): string | null =>
  intake.state === 'open' || intake.state === 'expired' ? intake.expiresAt : null;

export const toHistoryLines = (intake: IntakeSummary): HistoryLine[] => [
  ...lineOf('created', intake.createdAt),
  ...lineOf('expires', linkExpiryOf(intake)),
  ...lineOf('submitted', intake.submittedAt),
  ...lineOf('completed', intake.completedAt),
  ...lineOf('discarded', intake.discardedAt),
];
