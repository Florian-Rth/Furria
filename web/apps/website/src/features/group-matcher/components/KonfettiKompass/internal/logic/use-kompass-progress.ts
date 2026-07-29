import { useState } from 'react';
import {
  clearAnswersInSession,
  readAnswersFromSession,
  writeAnswersToSession,
} from '@/features/group-matcher/session-storage';
import type { KompassProgress } from './kompass-progress';
import {
  emptyKompassProgress,
  startKompassProgress,
  withAnswer,
  withPreviousQuestion,
  withSkippedQuestion,
} from './kompass-progress';

export interface KompassProgressControls {
  progress: KompassProgress;
  answerQuestion: (answer: string) => void;
  skipQuestion: () => void;
  goToPreviousQuestion: () => void;
  restart: () => void;
}

export const useKompassProgress = (questionIds: string[]): KompassProgressControls => {
  const [progress, setProgress] = useState(() =>
    startKompassProgress(questionIds, readAnswersFromSession(window.sessionStorage)),
  );

  const commit = (next: KompassProgress): void => {
    writeAnswersToSession(window.sessionStorage, next.answers);
    setProgress(next);
  };

  return {
    progress,
    answerQuestion: (answer: string): void => commit(withAnswer(progress, questionIds, answer)),
    skipQuestion: (): void => commit(withSkippedQuestion(progress, questionIds)),
    goToPreviousQuestion: (): void => setProgress(withPreviousQuestion(progress)),
    restart: (): void => {
      clearAnswersInSession(window.sessionStorage);
      setProgress(emptyKompassProgress());
    },
  };
};
