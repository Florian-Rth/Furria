import type { PublicGroup } from '@/lib/public-groups/schemas';
import { admissionAgeBandLabels, matcherAgeQuestionPrompt } from './matcher-content';
import type { PublicAdmissionAges, PublicGroupMatcherResponse, PublicStatement } from './schemas';
import { ADMISSION_AGE_BANDS } from './schemas';
import type { FilterQuestion, GroupMatcher, MatcherGroup, WeightedQuestion } from './types';

export const AGE_QUESTION_ID = 'age-band';

export const statementQuestionId = (statementId: number): string => `statement-${statementId}`;

const toMatcherGroup = (group: PublicGroup): MatcherGroup => ({
  id: group.groupId,
  name: group.name,
  description: group.description,
  isRecruiting: group.isRecruiting,
});

const toWeightedQuestion = (statement: PublicStatement): WeightedQuestion => ({
  id: statementQuestionId(statement.statementId),
  role: 'weighted',
  prompt: statement.text,
  positions: statement.stances.map((stance) => ({
    groupId: stance.groupId,
    stance: stance.position,
    importance: stance.importance,
  })),
});

const toAgeQuestion = (admissionAges: PublicAdmissionAges[]): FilterQuestion => ({
  id: AGE_QUESTION_ID,
  role: 'filter',
  prompt: matcherAgeQuestionPrompt,
  options: ADMISSION_AGE_BANDS.map((band) => ({ id: band, label: admissionAgeBandLabels[band] })),
  positions: admissionAges.flatMap((group) =>
    group.bands.length === 0 ? [] : [{ groupId: group.groupId, accepts: [...group.bands] }],
  ),
});

export const toGroupMatcher = (response: PublicGroupMatcherResponse): GroupMatcher => ({
  groups: response.groups.map(toMatcherGroup),
  questions: [
    toAgeQuestion(response.admissionAges),
    ...response.statements.map(toWeightedQuestion),
  ],
});
