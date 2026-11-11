import { describe, expect, it } from 'vitest';
import type { StatementPool } from './schemas';
import {
  groupMatcherPaneOf,
  isPoolFull,
  movedOrderOf,
  resolvePane,
  toCoverageRows,
  toCoverageTally,
  toStatementCoverageGroups,
  withAddition,
  withoutStatement,
  withRewording,
  withStatementOrder,
} from './statement-pool';

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

describe('groupMatcherPaneOf', () => {
  it.each([
    {
      routeId: '/_app/manage/group-matcher/statements/$statementId',
      statementId: '9',
      pane: { kind: 'statement', statementId: 9 },
    },
    { routeId: '/_app/manage/group-matcher/statements/$statementId', statementId: 'x', pane: null },
    { routeId: '/_app/manage/group-matcher/', statementId: undefined, pane: null },
  ])('reads $routeId with id $statementId', ({ routeId, statementId, pane }) => {
    expect(groupMatcherPaneOf({ routeId, params: { statementId } })).toEqual(pane);
  });

  it('opens no pane on the hub itself', () => {
    expect(groupMatcherPaneOf(undefined)).toBeNull();
  });
});

describe('movedOrderOf', () => {
  it.each([
    { from: 0, to: 2, order: [2, 3, 1] },
    { from: 2, to: 0, order: [3, 1, 2] },
    { from: 1, to: 1, order: null },
    { from: 5, to: 0, order: null },
    { from: 0, to: 3, order: null },
  ])('moves position $from to $to', ({ from, to, order }) => {
    expect(movedOrderOf([1, 2, 3], from, to)).toEqual(order);
  });
});

describe('withStatementOrder', () => {
  it('sorts the statements into the new order', () => {
    const ordered = withStatementOrder(pool(), [3, 1, 2]);

    expect(ordered?.statements.map((statement) => statement.statementId)).toEqual([3, 1, 2]);
  });
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

describe('toCoverageRows', () => {
  it('lines every group up with the statements and reads a missing cell as open', () => {
    const rows = toCoverageRows(pool());

    expect(rows.map((row) => row.cells.map((cell) => cell.state))).toEqual([
      ['answered', 'changed', 'answered'],
      ['open', 'answered', 'open'],
    ]);
  });
});

describe('toCoverageTally', () => {
  it.each([
    { statementId: 1, tally: { groupCount: 2, answered: 1, changed: 0, waiting: 1 } },
    { statementId: 2, tally: { groupCount: 2, answered: 1, changed: 1, waiting: 0 } },
    { statementId: 3, tally: { groupCount: 2, answered: 1, changed: 0, waiting: 1 } },
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

describe('withAddition', () => {
  it('appends the new statement at the end of the pool', () => {
    const added = withAddition(pool(), {
      provisionalId: -5,
      text: 'Wir tanzen gern',
      addedAt: '2026-11-10T09:00:00Z',
    });

    expect(added?.statements.map((statement) => statement.statementId)).toEqual([1, 2, 3, -5]);
  });
});

describe('resolvePane', () => {
  it.each([
    {
      pane: { kind: 'statement', statementId: 3 } as const,
      resolved: { kind: 'statement', index: 2 },
    },
    { pane: { kind: 'statement', statementId: 9 } as const, resolved: { kind: 'gone' } },
  ])('finds what $pane.kind $pane.statementId shows', ({ pane, resolved }) => {
    const found = resolvePane(pool(), pane);

    expect(found.kind === 'statement' ? { kind: found.kind, index: found.index } : found).toEqual(
      resolved,
    );
  });
});

describe('toStatementCoverageGroups', () => {
  it('sorts the groups into answered, changed and waiting', () => {
    const groups = toStatementCoverageGroups(pool(), 2);

    expect({
      answered: groups.answered.map((group) => group.groupId),
      changed: groups.changed.map((group) => group.groupId),
      waiting: groups.waiting.map((group) => group.groupId),
    }).toEqual({ answered: [8], changed: [7], waiting: [] });
  });
});
