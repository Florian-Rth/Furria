import { describe, expect, it } from 'vitest';
import type { RunningOrderResponse } from '@/features/running-order/schemas';
import { runningOrderChecksOf } from './running-order-step';

const lineAt = (
  lineId: number,
  position: number | null,
): RunningOrderResponse['lines'][number] => ({
  lineId,
  act: { actId: lineId, name: `Auftritt ${lineId}`, kind: null, group: null, cast: [] },
  position,
  pinned: false,
  blockKey: null,
  eveningChanged: false,
});

const conflict: RunningOrderResponse['findings'][number] = {
  kind: 'noChangeover',
  severity: 'conflict',
  lineIds: [1, 2],
  personIds: [7],
  ruleId: null,
  actWishId: null,
};

const hint: RunningOrderResponse['findings'][number] = {
  kind: 'sameKindAdjacent',
  severity: 'hint',
  lineIds: [2, 3],
  personIds: [],
  ruleId: null,
  actWishId: null,
};

const response = (overrides: Partial<RunningOrderResponse>): RunningOrderResponse => ({
  eventId: 16,
  version: 3,
  confirmedAt: null,
  changedSinceConfirmed: false,
  lines: [lineAt(1, 0), lineAt(2, 1), lineAt(3, 2)],
  rules: [],
  actWishes: [],
  findings: [],
  ...overrides,
});

describe('runningOrderChecksOf', () => {
  it.each([
    {
      name: 'a confirmed order without findings stands',
      overrides: { confirmedAt: '2026-10-20T18:00:00Z' },
      expected: ['done', 'done', 'done', 'stands', undefined],
    },
    {
      name: 'a change after confirming reopens the standing',
      overrides: { confirmedAt: '2026-10-20T18:00:00Z', changedSinceConfirmed: true },
      expected: ['done', 'done', 'current', 'changed', undefined],
    },
    {
      name: 'an unplaced act leaves placing open',
      overrides: { lines: [lineAt(1, 0), lineAt(2, null)] },
      expected: ['open', 'done', 'open', 'open', undefined],
    },
    {
      name: 'a conflict marks the conflicts check',
      overrides: { findings: [conflict, hint] },
      expected: ['done', 'overdue', 'open', 'open', 'conflict'],
    },
    {
      name: 'an empty order checks nothing off',
      overrides: { lines: [] },
      expected: ['open', 'open', 'open', 'open', undefined],
    },
  ])('$name', ({ overrides, expected }) => {
    const checks = runningOrderChecksOf(response(overrides));

    expect([
      checks.placedState,
      checks.conflictsState,
      checks.standingState,
      checks.standing,
      checks.conflictsSeverity,
    ]).toEqual(expected);
  });

  it('counts acts, placed acts and findings', () => {
    const checks = runningOrderChecksOf(
      response({
        lines: [lineAt(1, 0), lineAt(2, 1), lineAt(3, null)],
        findings: [conflict, hint],
      }),
    );

    expect([checks.acts, checks.placed, checks.conflicts, checks.hints]).toEqual([3, 2, 1, 1]);
  });
});
