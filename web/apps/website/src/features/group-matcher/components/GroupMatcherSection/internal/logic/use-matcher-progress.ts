import { useState } from 'react';
import { buildAnsweredSummary, buildProgressLabel } from '@/features/group-matcher/matcher-content';
import {
  clearAnswersInSession,
  readAnswersFromSession,
  writeAnswersToSession,
} from '@/features/group-matcher/session-storage';
import type { GroupMatcher, MatcherQuestion } from '@/lib/seed/group-matcher';
import type { MatcherProgress } from './matcher-progress';
import {
  countAnsweredQuestions,
  emptyMatcherProgress,
  resolveProgressPercent,
  startMatcherProgress,
  withAnswer,
  withFinishedQuestions,
  withPreviousQuestion,
  withSkippedQuestion,
} from './matcher-progress';
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

export interface MatcherProgressControls extends MatcherStepView {
  answerQuestion: (answer: string) => void;
  skipQuestion: () => void;
  goToPreviousQuestion: () => void;
  finishQuestions: () => void;
  restart: () => void;
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

export const useMatcherProgress = (matcher: GroupMatcher): MatcherProgressControls => {
  const questionIds = selectQuestionIds(matcher);
  const [progress, setProgress] = useState(() =>
    startMatcherProgress(questionIds, readAnswersFromSession(window.sessionStorage)),
  );

  const commit = (next: MatcherProgress): void => {
    writeAnswersToSession(window.sessionStorage, next.answers);
    setProgress(next);
  };

  return {
    ...selectMatcherStepView(matcher, progress),
    answerQuestion: (answer: string): void => commit(withAnswer(progress, questionIds, answer)),
    skipQuestion: (): void => commit(withSkippedQuestion(progress, questionIds)),
    goToPreviousQuestion: (): void => setProgress(withPreviousQuestion(progress)),
    finishQuestions: (): void => setProgress(withFinishedQuestions(progress)),
    restart: (): void => {
      clearAnswersInSession(window.sessionStorage);
      setProgress(emptyMatcherProgress());
    },
  };
};
