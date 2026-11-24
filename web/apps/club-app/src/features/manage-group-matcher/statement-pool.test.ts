import { describe, expect, it } from 'vitest';
import type { StatementPool } from './schemas';
import { isPoolFull, toCoverageTally, withoutStatement, withRewording } from './statement-pool';

const pool = (): StatementPool => ({
  statements: [
    { statementId: 1, text: 'A', addedAt: '2026-11-01T10:00:00Z', rewordedAt: null },
    { statementId: 2, text: 'B', addedAt: '2026-11-01T10:00:00Z', rewordedAt: null },
    { statementId: 3, text: 'C', addedAt: '2026-11-01T10:00:00Z', rewordedAt: null },
  ],
  coverage: [
    {
      group: { groupId: 7, name: 'Garde', tone: null },
      isTakingPart: true,
      cells: [
        { statementId: 1, state: 'answered' },
        { statementId: 2, state: 'changed' },
        { statementId: 3, state: 'answered' },
      ],
    },
    {
      group: { groupId: 8, name: 'Elferrat', tone: null },
      isTakingPart: false,
      cells: [
        { statementId: 1, state: 'open' },
        { statementId: 2, state: 'answered' },
      ],
    },
  ],
});

describe('withRewording', () => {
  it('flags only the groups that had answered as changed', () => {
    const reworded = withRewording(pool(), { statementId: 1, text: 'A neu' });

    expect({
      text: reworded?.statements[0]?.text,
      states: reworded?.coverage.map(
        (coverage) => coverage.cells.find((cell) => cell.statementId === 1)?.state,
      ),
      untouched: reworded?.coverage[0]?.cells.find((cell) => cell.statementId === 3)?.state,
    }).toEqual({ text: 'A neu', states: ['changed', 'open'], untouched: 'answered' });
  });
});

describe('withoutStatement', () => {
  it('drops the statement and every group’s cell for it', () => {
    const left = withoutStatement(pool(), 2);

    expect({
      statements: left?.statements.map((statement) => statement.statementId),
      cells: left?.coverage.map((coverage) => coverage.cells.map((cell) => cell.statementId)),
    }).toEqual({ statements: [1, 3], cells: [[1, 3], [1]] });
  });
});

describe('toCoverageTally', () => {
  it.each([
    { statementId: 1, tally: { groupCount: 2, answered: 1, changed: 0, waiting: 1 } },
    { statementId: 2, tally: { groupCount: 2, answered: 1, changed: 1, waiting: 0 } },
  ])('counts the groups for statement $statementId', ({ statementId, tally }) => {
    expect(toCoverageTally(pool(), statementId)).toEqual(tally);
  });
});

describe('isPoolFull', () => {
  it.each([
    { count: 9, full: false },
    { count: 10, full: true },
  ])('is full at ten statements ($count)', ({ count, full }) => {
    const statements = Array.from({ length: count }, (_, index) => ({
      statementId: index + 1,
      text: 'A',
      addedAt: '2026-11-01T10:00:00Z',
      rewordedAt: null,
    }));

    expect(isPoolFull({ statements, coverage: [] })).toBe(full);
  });
});
