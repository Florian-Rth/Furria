import type { MatcherAnswers } from '@/features/group-matcher/schemas';

export const SKIPPED_ANSWER = 'skipped';

export interface MatcherProgress {
  index: number;
  answers: MatcherAnswers;
  finished: boolean;
}

const keepKnownAnswers = (questionIds: string[], answers: MatcherAnswers): MatcherAnswers =>
  Object.fromEntries(
    questionIds.flatMap((questionId) => {
      const answer = answers[questionId];

      return answer === undefined ? [] : [[questionId, answer]];
    }),
  );

export const emptyMatcherProgress = (): MatcherProgress => ({
  index: 0,
  answers: {},
  finished: false,
});

export const startMatcherProgress = (
  questionIds: string[],
  answers: MatcherAnswers,
): MatcherProgress => {
  const known = keepKnownAnswers(questionIds, answers);
  const unanswered = questionIds.findIndex((questionId) => known[questionId] === undefined);

  return {
    index: unanswered === -1 ? questionIds.length : unanswered,
    answers: known,
    finished: false,
  };
};

export const withAnswer = (
  progress: MatcherProgress,
  questionIds: string[],
  answer: string,
): MatcherProgress => {
  const questionId = questionIds[progress.index];

  if (questionId === undefined) {
    return progress;
  }

  return {
    ...progress,
    index: progress.index + 1,
    answers: { ...progress.answers, [questionId]: answer },
  };
};

export const withSkippedQuestion = (
  progress: MatcherProgress,
  questionIds: string[],
): MatcherProgress => withAnswer(progress, questionIds, SKIPPED_ANSWER);

export const withFinishedQuestions = (progress: MatcherProgress): MatcherProgress => ({
  ...progress,
  finished: true,
});

export const withPreviousQuestion = (progress: MatcherProgress): MatcherProgress => {
  if (progress.finished) {
    return { ...progress, finished: false };
  }

  return { ...progress, index: Math.max(progress.index - 1, 0) };
};

export const countAnsweredQuestions = (answers: MatcherAnswers): number =>
  Object.values(answers).filter((answer) => answer !== SKIPPED_ANSWER).length;

export const resolveProgressPercent = (
  progress: MatcherProgress,
  questionIds: string[],
): number => {
  if (questionIds.length === 0) {
    return 0;
  }

  const answered = Math.min(progress.index, questionIds.length);

  return Math.round((answered / questionIds.length) * 100);
};
