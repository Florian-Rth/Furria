import { describe, expect, it } from 'vitest';
import {
  countStatementsAwaitingStance,
  inStatementOrder,
  settleStatementOrder,
  stanceWithImportance,
  stanceWithPosition,
  toGroupMatcherStanding,
  toggleAdmissionAge,
  withStance,
} from './group-matcher-page';
import type { GroupStatement } from './schemas';

const statement = (
  statementId: number,
  state: GroupStatement['state'],
  stance: Pick<GroupStatement, 'position' | 'importance'> = { position: null, importance: null },
): GroupStatement => ({ statementId, text: `Aussage ${statementId}`, state, ...stance });

describe('settleStatementOrder', () => {
  it('puts new, changed and open statements first, keeping club order within each', () => {
    const statements = [
      statement(1, 'answered'),
      statement(2, 'open'),
      statement(3, 'changed'),
      statement(4, 'answered'),
      statement(5, 'new'),
      statement(6, 'open'),
    ];

    expect(settleStatementOrder(null, statements)).toEqual([5, 3, 2, 6, 1, 4]);
  });

  it('keeps the held order while the same statements are shown', () => {
    const statements = [statement(1, 'answered'), statement(2, 'answered')];

    expect(settleStatementOrder([2, 1], statements)).toEqual([2, 1]);
  });

  it.each([
    { held: [1], statements: [statement(1, 'answered'), statement(2, 'new')], expected: [2, 1] },
    { held: [1, 2], statements: [statement(2, 'open')], expected: [2] },
    {
      held: [1, 3],
      statements: [statement(1, 'answered'), statement(2, 'open')],
      expected: [2, 1],
    },
  ])(
    'settles a fresh order when the statements change ($expected)',
    ({ held, statements, expected }) => {
      expect(settleStatementOrder(held, statements)).toEqual(expected);
    },
  );
});

describe('inStatementOrder', () => {
  it('lists the statements in the given order and skips unknown ids', () => {
    const statements = [statement(1, 'answered'), statement(2, 'open')];

    expect(inStatementOrder(statements, [2, 9, 1]).map((entry) => entry.statementId)).toEqual([
      2, 1,
    ]);
  });
});

describe('countStatementsAwaitingStance', () => {
  it('counts every statement that is not answered', () => {
    const statements = [
      statement(1, 'answered'),
      statement(2, 'open'),
      statement(3, 'new'),
      statement(4, 'changed'),
    ];

    expect(countStatementsAwaitingStance(statements)).toBe(3);
  });
});

describe('toggleAdmissionAge', () => {
  it.each([
    { selected: [], band: 'eighteenPlus', expected: ['eighteenPlus'] },
    {
      selected: ['eighteenPlus', 'underTwelve'],
      band: 'fourteenToFifteen',
      expected: ['underTwelve', 'fourteenToFifteen', 'eighteenPlus'],
    },
    { selected: ['underTwelve', 'eighteenPlus'], band: 'underTwelve', expected: ['eighteenPlus'] },
  ] as const)('toggles $band', ({ selected, band, expected }) => {
    expect(toggleAdmissionAge(selected, band)).toEqual(expected);
  });
});

describe('stanceWithPosition', () => {
  it.each([
    { importance: null, expected: 2 },
    { importance: 3, expected: 3 },
  ] as const)(
    'keeps importance $importance or falls back to $expected',
    ({ importance, expected }) => {
      const answered = statement(4, 'open', { position: null, importance });

      expect(stanceWithPosition(answered, 'no')).toEqual({
        statementId: 4,
        position: 'no',
        importance: expected,
      });
    },
  );
});

describe('stanceWithImportance', () => {
  it('needs a position before an importance can be saved', () => {
    expect(stanceWithImportance(statement(4, 'open'), 3)).toBeNull();
  });

  it('keeps the position and takes the new importance', () => {
    const answered = statement(4, 'answered', { position: 'neutral', importance: 1 });

    expect(stanceWithImportance(answered, 3)).toEqual({
      statementId: 4,
      position: 'neutral',
      importance: 3,
    });
  });
});

describe('withStance', () => {
  it('marks only the touched statement answered with the new stance', () => {
    const page = {
      isTakingPart: false,
      statements: [
        statement(1, 'changed', { position: 'yes', importance: 1 }),
        statement(2, 'open'),
      ],
      admissionAges: [],
    };

    expect(withStance(page, { statementId: 1, position: 'no', importance: 3 })?.statements).toEqual(
      [statement(1, 'answered', { position: 'no', importance: 3 }), statement(2, 'open')],
    );
  });
});

describe('toGroupMatcherStanding', () => {
  it.each([
    { status: { isTakingPart: true, openStatements: 2 }, expected: { kind: 'awaiting', count: 2 } },
    {
      status: { isTakingPart: false, openStatements: 4 },
      expected: { kind: 'awaiting', count: 4 },
    },
    { status: { isTakingPart: true, openStatements: 0 }, expected: { kind: 'takingPart' } },
    { status: { isTakingPart: false, openStatements: 0 }, expected: { kind: 'notTakingPart' } },
  ])('reads $expected.kind', ({ status, expected }) => {
    expect(toGroupMatcherStanding(status)).toEqual(expected);
  });
});
