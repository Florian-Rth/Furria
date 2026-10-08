import { buildAnsweredSummary, buildProgressLabel } from '@/features/group-matcher/matcher-content';
import type { GroupMatcher, MatcherQuestion } from '@/lib/seed/group-matcher';
import type { MatcherProgress } from './matcher-progress';
import { countAnsweredQuestions, resolveProgressPercent } from './matcher-progress';
import type { MatcherResultView } from './matcher-result';
import { selectMatcherResult } from './matcher-result';

export type MatcherStep =
  | { kind: 'question'; question: MatcherQuestion; backDisabled: boolean; finishDisabled: boolean }
  | { kind: 'result'; view: MatcherResultView; summary: string };

export interface MatcherStepView {
  step: MatcherStep;
  progressLabel: string;
  percent: number;
}

export const selectQuestionIds = (matcher: GroupMatcher): string[] =>
  matcher.questions.map((question) => question.id);

const resolveStep = (
  matcher: GroupMatcher,
  progress: MatcherProgress,
  total: number,
): MatcherStep => {
  const question = matcher.questions[progress.index];
  const answered = countAnsweredQuestions(progress.answers);

  if (progress.finished || question === undefined) {
    return {
      kind: 'result',
      view: selectMatcherResult(matcher, progress.answers),
      summary: buildAnsweredSummary(answered, total),
    };
  }

  return {
    kind: 'question',
    question,
    backDisabled: progress.index === 0,
    finishDisabled: answered === 0,
  };
};

export const selectMatcherStepView = (
  matcher: GroupMatcher,
  progress: MatcherProgress,
): MatcherStepView => {
  const questionIds = selectQuestionIds(matcher);

  return {
    step: resolveStep(matcher, progress, questionIds.length),
    progressLabel: buildProgressLabel(progress.index, questionIds.length),
    percent: resolveProgressPercent(progress, questionIds),
  };
};
