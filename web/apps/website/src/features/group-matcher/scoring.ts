import type {
  FilterQuestion,
  GroupMatcher,
  MatcherQuestion,
  Stance,
  WeightedQuestion,
} from '@/lib/seed/group-matcher';
import { StanceSchema } from '@/lib/seed/group-matcher';
import type { Group } from '@/lib/seed/groups';
import type { MatcherAnswers } from './schemas';

export const FULL_AGREEMENT = 2;

export interface GroupMatch {
  group: Group;
  score: number;
  percentage: number;
}

export interface GroupExclusion {
  group: Group;
  questionId: string;
  questionPrompt: string;
  answerLabel: string;
}

export type MatchOutcome =
  | { status: 'unanswered' }
  | { status: 'no-matches'; excluded: GroupExclusion[] }
  | { status: 'ranked'; matches: GroupMatch[]; excluded: GroupExclusion[] };

interface GroupPoints {
  achieved: number;
  possible: number;
}

export const agreementScore = (answer: Stance, stance: Stance): number => {
  if (answer === stance) {
    return FULL_AGREEMENT;
  }

  if (answer === 'neutral' || stance === 'neutral') {
    return 1;
  }

  return 0;
};

export const readStance = (answer: string | undefined): Stance | null => {
  const parsed = StanceSchema.safeParse(answer);

  return parsed.success ? parsed.data : null;
};

export const weightedQuestions = (questions: MatcherQuestion[]): WeightedQuestion[] =>
  questions.flatMap((question) => (question.role === 'weighted' ? [question] : []));

export const filterQuestions = (questions: MatcherQuestion[]): FilterQuestion[] =>
  questions.flatMap((question) => (question.role === 'filter' ? [question] : []));

const findExclusion = (
  group: Group,
  questions: FilterQuestion[],
  answers: MatcherAnswers,
): GroupExclusion | null => {
  const rejecting = questions.flatMap((question) => {
    const option = question.options.find((candidate) => candidate.id === answers[question.id]);
    const position = question.positions.find((candidate) => candidate.groupId === group.id);

    if (option === undefined || position === undefined || position.accepts.includes(option.id)) {
      return [];
    }

    return [
      {
        group,
        questionId: question.id,
        questionPrompt: question.prompt,
        answerLabel: option.label,
      },
    ];
  });

  return rejecting[0] ?? null;
};

const countPoints = (
  group: Group,
  questions: WeightedQuestion[],
  answers: MatcherAnswers,
): GroupPoints =>
  questions.reduce<GroupPoints>(
    (points, question) => {
      const answer = readStance(answers[question.id]);
      const position = question.positions.find((candidate) => candidate.groupId === group.id);

      if (answer === null || position === undefined) {
        return points;
      }

      return {
        achieved: points.achieved + position.importance * agreementScore(answer, position.stance),
        possible: points.possible + position.importance * FULL_AGREEMENT,
      };
    },
    { achieved: 0, possible: 0 },
  );

export const rankGroups = (matcher: GroupMatcher, answers: MatcherAnswers): MatchOutcome => {
  const filters = filterQuestions(matcher.questions);
  const verdicts = matcher.groups.map((group) => ({
    group,
    exclusion: findExclusion(group, filters, answers),
  }));

  const excluded = verdicts.flatMap((verdict) =>
    verdict.exclusion === null ? [] : [verdict.exclusion],
  );
  const eligible = verdicts.flatMap((verdict) =>
    verdict.exclusion === null ? [verdict.group] : [],
  );

  if (eligible.length === 0) {
    return { status: 'no-matches', excluded };
  }

  const weighted = weightedQuestions(matcher.questions);
  const scored = eligible.flatMap((group, rosterIndex) => {
    const points = countPoints(group, weighted, answers);

    if (points.possible === 0) {
      return [];
    }

    const score = points.achieved / points.possible;

    return [{ group, rosterIndex, score, percentage: Math.round(score * 100) }];
  });

  if (scored.length === 0) {
    return { status: 'unanswered' };
  }

  const matches = scored
    .toSorted(
      (first, second) => second.score - first.score || first.rosterIndex - second.rosterIndex,
    )
    .map(({ group, score, percentage }) => ({ group, score, percentage }));

  return { status: 'ranked', matches, excluded };
};
