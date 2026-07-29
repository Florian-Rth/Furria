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
  withFinishedQuestions,
  withPreviousQuestion,
  withSkippedQuestion,
} from './kompass-progress';
import type { KompassResultView } from './kompass-result';
import { selectKompassResult } from './kompass-result';

export type KompassStep =
  | { kind: 'question'; question: MatcherQuestion; backDisabled: boolean; finishDisabled: boolean }
  | { kind: 'result'; view: KompassResultView; summary: string };

export interface KompassStepView {
  step: KompassStep;
  progressLabel: string;
  percent: number;
}

export interface KompassProgressControls extends KompassStepView {
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
  progress: KompassProgress,
  total: number,
): KompassStep => {
  const question = matcher.questions[progress.index];
  const answered = countAnsweredQuestions(progress.answers);

  if (progress.finished || question === undefined) {
    return {
      kind: 'result',
      view: selectKompassResult(matcher, progress.answers),
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
    finishQuestions: (): void => setProgress(withFinishedQuestions(progress)),
    restart: (): void => {
      clearAnswersInSession(window.sessionStorage);
      setProgress(emptyKompassProgress());
    },
  };
};
