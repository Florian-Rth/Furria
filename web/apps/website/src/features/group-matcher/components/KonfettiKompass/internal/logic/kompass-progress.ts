import type { MatcherAnswers } from '@/features/group-matcher/schemas';

export const SKIPPED_ANSWER = 'skipped';

export interface KompassProgress {
  index: number;
  answers: MatcherAnswers;
}

const keepKnownAnswers = (questionIds: string[], answers: MatcherAnswers): MatcherAnswers =>
  Object.fromEntries(
    questionIds.flatMap((questionId) => {
      const answer = answers[questionId];

      return answer === undefined ? [] : [[questionId, answer]];
    }),
  );

export const emptyKompassProgress = (): KompassProgress => ({ index: 0, answers: {} });

export const startKompassProgress = (
  questionIds: string[],
  answers: MatcherAnswers,
): KompassProgress => {
  const known = keepKnownAnswers(questionIds, answers);
  const unanswered = questionIds.findIndex((questionId) => known[questionId] === undefined);

  return { index: unanswered === -1 ? questionIds.length : unanswered, answers: known };
};

export const withAnswer = (
  progress: KompassProgress,
  questionIds: string[],
  answer: string,
): KompassProgress => {
  const questionId = questionIds[progress.index];

  if (questionId === undefined) {
    return progress;
  }

  return {
    index: progress.index + 1,
    answers: { ...progress.answers, [questionId]: answer },
  };
};

export const withSkippedQuestion = (
  progress: KompassProgress,
  questionIds: string[],
): KompassProgress => withAnswer(progress, questionIds, SKIPPED_ANSWER);

export const withPreviousQuestion = (progress: KompassProgress): KompassProgress => ({
  ...progress,
  index: Math.max(progress.index - 1, 0),
});

export const countAnsweredQuestions = (answers: MatcherAnswers): number =>
  Object.values(answers).filter((answer) => answer !== SKIPPED_ANSWER).length;

export const resolveProgressPercent = (
  progress: KompassProgress,
  questionIds: string[],
): number => {
  if (questionIds.length === 0) {
    return 0;
  }

  const answered = Math.min(progress.index, questionIds.length);

  return Math.round((answered / questionIds.length) * 100);
};
