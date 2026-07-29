import type { Importance, MatcherQuestion, Stance } from '@/lib/seed/group-matcher';
import type { Group } from '@/lib/seed/groups';
import type { MatcherAnswers } from './schemas';
import { agreementScore, FULL_AGREEMENT, readStance, weightedQuestions } from './scoring';

export type MatchAgreement = 'agree' | 'partial' | 'disagree';

export interface MatchReason {
  questionId: string;
  prompt: string;
  agreement: MatchAgreement;
  answer: Stance;
  stance: Stance;
  importance: Importance;
}

export const classifyAgreement = (answer: Stance, stance: Stance): MatchAgreement => {
  const agreement = agreementScore(answer, stance);

  if (agreement === FULL_AGREEMENT) {
    return 'agree';
  }

  return agreement === 0 ? 'disagree' : 'partial';
};

export const buildMatchReasons = (
  group: Group,
  questions: MatcherQuestion[],
  answers: MatcherAnswers,
): MatchReason[] =>
  weightedQuestions(questions)
    .flatMap((question, questionIndex) => {
      const answer = readStance(answers[question.id]);
      const position = question.positions.find((candidate) => candidate.groupId === group.id);

      if (answer === null || position === undefined) {
        return [];
      }

      return [
        {
          questionIndex,
          weight: position.importance * agreementScore(answer, position.stance),
          reason: {
            questionId: question.id,
            prompt: question.prompt,
            agreement: classifyAgreement(answer, position.stance),
            answer,
            stance: position.stance,
            importance: position.importance,
          },
        },
      ];
    })
    .toSorted(
      (first, second) => second.weight - first.weight || first.questionIndex - second.questionIndex,
    )
    .map((entry) => entry.reason);
