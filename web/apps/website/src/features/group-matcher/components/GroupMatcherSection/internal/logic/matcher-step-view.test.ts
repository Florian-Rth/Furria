import { describe, expect, it } from 'vitest';
import type { GroupMatcher } from '@/lib/seed/group-matcher';
import type { MatcherProgress } from './matcher-progress';
import { SKIPPED_ANSWER } from './matcher-progress';
import { selectMatcherStepView } from './matcher-step-view';

const matcher: GroupMatcher = {
  groups: [
    {
      id: 'alpha',
      name: 'ALPHA',
      ageRange: { from: 6, to: null },
      isRecruiting: true,
      tagline: 'Ergebniszeile',
    },
  ],
  questions: ['stage', 'build', 'ritual'].map((id) => ({
    id,
    role: 'weighted',
    prompt: id,
    positions: [{ groupId: 'alpha', stance: 'yes', importance: 1 }],
  })),
};

const shapeOf = (progress: MatcherProgress): (string | boolean | number)[] => {
  const { step, percent } = selectMatcherStepView(matcher, progress);

  return step.kind === 'question'
    ? [step.kind, step.backDisabled, step.finishDisabled, percent]
    : [step.kind, step.view.kind, percent];
};

describe('selectMatcherStepView', () => {
  it.each<[string, MatcherProgress, (string | boolean | number)[]]>([
    [
      'the first question offers no way back and no result',
      { index: 0, answers: {}, finished: false },
      ['question', true, true, 0],
    ],
    [
      'an answer opens the way back and the result',
      { index: 1, answers: { stage: 'yes' }, finished: false },
      ['question', false, false, 33],
    ],
    [
      'only skipped questions keep the result out of reach',
      { index: 1, answers: { stage: SKIPPED_ANSWER }, finished: false },
      ['question', false, true, 33],
    ],
    [
      'the last answer closes on the ranking',
      { index: 3, answers: { stage: 'yes', build: 'yes', ritual: 'yes' }, finished: false },
      ['result', 'ranking', 100],
    ],
    [
      'asking for the result mid-quiz shows it at once',
      { index: 1, answers: { stage: 'yes' }, finished: true },
      ['result', 'ranking', 33],
    ],
    [
      'skipping every question asks for an answer',
      {
        index: 3,
        answers: { stage: SKIPPED_ANSWER, build: SKIPPED_ANSWER, ritual: SKIPPED_ANSWER },
        finished: false,
      },
      ['result', 'unanswered', 100],
    ],
  ])('%s', (_, progress, shape) => {
    expect(shapeOf(progress)).toEqual(shape);
  });
});
