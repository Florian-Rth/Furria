import { describe, expect, it } from 'vitest';
import { stanceWithImportance, stanceWithPosition, withStance } from './group-matcher-page';
import type { GroupStatement } from './schemas';

const statement = (
  statementId: number,
  state: GroupStatement['state'],
  stance: Pick<GroupStatement, 'position' | 'importance'> = { position: null, importance: null },
): GroupStatement => ({ statementId, text: `Aussage ${statementId}`, state, ...stance });

describe('stanceWithPosition', () => {
  it.each([{ importance: null, expected: 2 }] as const)(
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
