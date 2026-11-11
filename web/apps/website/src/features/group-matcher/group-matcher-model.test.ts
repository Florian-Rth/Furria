import { describe, expect, it } from 'vitest';
import { AGE_QUESTION_ID, statementQuestionId, toGroupMatcher } from './group-matcher-model';
import type { PublicGroupMatcherResponse } from './schemas';
import type { FilterQuestion, MatcherQuestion } from './types';

const response: PublicGroupMatcherResponse = {
  groups: [
    {
      groupId: 7,
      name: 'Tanzgarde',
      picture: null,
      description: 'Tanzen',
      isRecruiting: true,
      groupKindName: null,
      foundedYear: null,
      tone: null,
    },
    {
      groupId: 9,
      name: 'Elferrat',
      picture: null,
      description: '',
      isRecruiting: false,
      groupKindName: null,
      foundedYear: null,
      tone: null,
    },
  ],
  statements: [
    { statementId: 4, text: 'Erste', stances: [{ groupId: 7, position: 'yes', importance: 3 }] },
    { statementId: 2, text: 'Zweite', stances: [] },
  ],
  admissionAges: [
    { groupId: 7, bands: ['fourteenToFifteen', 'eighteenPlus'] },
    { groupId: 9, bands: [] },
  ],
};

const ageQuestionOf = (questions: MatcherQuestion[]): FilterQuestion | undefined =>
  questions.find((question): question is FilterQuestion => question.role === 'filter');

describe('toGroupMatcher', () => {
  it('asks the age first, then the statements in the served order', () => {
    expect(toGroupMatcher(response).questions.map((question) => question.id)).toEqual([
      AGE_QUESTION_ID,
      statementQuestionId(4),
      statementQuestionId(2),
    ]);
  });

  it('knocks out only groups that ticked admission ages', () => {
    const ageQuestion = ageQuestionOf(toGroupMatcher(response).questions);

    expect(ageQuestion?.positions).toEqual([
      { groupId: 7, accepts: ['fourteenToFifteen', 'eighteenPlus'] },
    ]);
  });

  it('carries each stance under the numeric group id', () => {
    const [, first] = toGroupMatcher(response).questions;

    expect(first?.role === 'weighted' && first.positions).toEqual([
      { groupId: 7, stance: 'yes', importance: 3 },
    ]);
  });
});
