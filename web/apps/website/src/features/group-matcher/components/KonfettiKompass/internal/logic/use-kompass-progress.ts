import { useState } from 'react';
import { buildAnsweredSummary, buildProgressLabel } from '@/features/group-matcher/kompass-content';
import {
  clearAnswersInSession,
  readAnswersFromSession,
  writeAnswersToSession,
} from '@/features/group-matcher/session-storage';
import type { GroupMatcher, MatcherQuestion } from '@/lib/seed/group-matcher';
import type { KompassProgress } from './kompass-progress';
import {
  countAnsweredQuestions,
  emptyKompassProgress,
  resolveProgressPercent,
  startKompassProgress,
  withAnswer,
  withPreviousQuestion,
  withSkippedQuestion,
} from './kompass-progress';

export type KompassStep =
  | { kind: 'question'; question: MatcherQuestion; backDisabled: boolean }
  | { kind: 'done'; summary: string };

export interface KompassStepView {
  step: KompassStep;
  progressLabel: string;
  percent: number;
}

export interface KompassProgressControls extends KompassStepView {
  answerQuestion: (answer: string) => void;
  skipQuestion: () => void;
  goToPreviousQuestion: () => void;
  restart: () => void;
}

export const selectQuestionIds = (matcher: GroupMatcher): string[] =>
  matcher.questions.map((question) => question.id);

const resolveStep = (
  matcher: GroupMatcher,
  progress: KompassProgress,
  total: number,
): KompassStep => {
  const question = matcher.questions[progress.index];

  if (question === undefined) {
    return {
      kind: 'done',
      summary: buildAnsweredSummary(countAnsweredQuestions(progress.answers), total),
    };
  }

  return { kind: 'question', question, backDisabled: progress.index === 0 };
};

export const selectKompassStepView = (
  matcher: GroupMatcher,
  progress: KompassProgress,
): KompassStepView => {
  const questionIds = selectQuestionIds(matcher);

  return {
    step: resolveStep(matcher, progress, questionIds.length),
    progressLabel: buildProgressLabel(progress.index, questionIds.length),
    percent: resolveProgressPercent(progress, questionIds),
  };
};

export const useKompassProgress = (matcher: GroupMatcher): KompassProgressControls => {
  const questionIds = selectQuestionIds(matcher);
  const [progress, setProgress] = useState(() =>
    startKompassProgress(questionIds, readAnswersFromSession(window.sessionStorage)),
  );

  const commit = (next: KompassProgress): void => {
    writeAnswersToSession(window.sessionStorage, next.answers);
    setProgress(next);
  };

  return {
    ...selectKompassStepView(matcher, progress),
    answerQuestion: (answer: string): void => commit(withAnswer(progress, questionIds, answer)),
    skipQuestion: (): void => commit(withSkippedQuestion(progress, questionIds)),
    goToPreviousQuestion: (): void => setProgress(withPreviousQuestion(progress)),
    restart: (): void => {
      clearAnswersInSession(window.sessionStorage);
      setProgress(emptyKompassProgress());
    },
  };
};
