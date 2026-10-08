import { useState } from 'react';
import {
  clearAnswersInSession,
  readAnswersFromSession,
  writeAnswersToSession,
} from '@/features/group-matcher/session-storage';
import type { GroupMatcher } from '@/lib/seed/group-matcher';
import type { MatcherProgress } from './matcher-progress';
import {
  emptyMatcherProgress,
  startMatcherProgress,
  withAnswer,
  withFinishedQuestions,
  withPreviousQuestion,
  withSkippedQuestion,
} from './matcher-progress';
import type { MatcherStepView } from './matcher-step-view';
import { selectMatcherStepView, selectQuestionIds } from './matcher-step-view';

export interface MatcherProgressControls extends MatcherStepView {
  answerQuestion: (answer: string) => void;
  skipQuestion: () => void;
  goToPreviousQuestion: () => void;
  finishQuestions: () => void;
  restart: () => void;
}

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
