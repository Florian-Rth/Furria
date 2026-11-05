import { describe, expect, it } from 'vitest';
import type { TablePlanDocument, TableRow } from '@/features/hall-plan/schemas';
import type { PlannerSelection } from './planner-selection';
import { inspectorTargetOf, pressRow, pruneSelection } from './planner-selection';

const row = (id: string, groupId: string | null = null): TableRow => ({
  id,
  tableTypeId: 1,
  count: 1,
  x: 0,
  y: 0,
  rotation: 0,
  seating: null,
  groupId,
  sides: { front: true, back: true, start: true, end: true },
  number: null,
  note: null,
  chairs: [],
});

const document: TablePlanDocument = {
  seating: 'comfortable',
  rows: [row('r1', 'g1'), row('r2', 'g1'), row('r3')],
  groups: [{ id: 'g1', number: null, note: null }],
};

const rows = (...rowIds: string[]): PlannerSelection => ({ kind: 'rows', rowIds });
const none: PlannerSelection = { kind: 'none' };

describe('pressRow', () => {
  it.each([
    {
      name: 'a loose row',
      selection: none,
      rowId: 'r3',
      additive: false,
      next: rows('r3'),
      drill: null,
    },
    {
      name: 'a grouped row picks the group',
      selection: none,
      rowId: 'r1',
      additive: false,
      next: rows('r1', 'r2'),
      drill: null,
    },
    {
      name: 'the selected group drills on release',
      selection: rows('r1', 'r2'),
      rowId: 'r2',
      additive: false,
      next: rows('r1', 'r2'),
      drill: 'r2',
    },
    {
      name: 'a selected loose row stays',
      selection: rows('r3'),
      rowId: 'r3',
      additive: false,
      next: rows('r3'),
      drill: null,
    },
    {
      name: 'shift adds the group',
      selection: rows('r3'),
      rowId: 'r1',
      additive: true,
      next: rows('r3', 'r1', 'r2'),
      drill: null,
    },
    {
      name: 'shift removes a selected group',
      selection: rows('r3', 'r1', 'r2'),
      rowId: 'r2',
      additive: true,
      next: rows('r3'),
      drill: null,
    },
    {
      name: 'shift removes the last row',
      selection: rows('r3'),
      rowId: 'r3',
      additive: true,
      next: none,
      drill: null,
    },
  ])('$name', ({ selection, rowId, additive, next, drill }) => {
    expect(pressRow(document, selection, rowId, additive)).toEqual({
      selection: next,
      drillOnRelease: drill,
    });
  });
});

describe('inspectorTargetOf', () => {
  it.each([
    { name: 'nothing', selection: none, kind: 'plan' },
    { name: 'one row', selection: rows('r3'), kind: 'row' },
    { name: 'one row of a group', selection: rows('r1'), kind: 'row' },
    { name: 'a whole group', selection: rows('r2', 'r1'), kind: 'group' },
    { name: 'rows across groups', selection: rows('r1', 'r3'), kind: 'rows' },
    {
      name: 'a chair',
      selection: {
        kind: 'chair' as const,
        chair: { rowId: 'r3', side: 'front' as const, index: 0 },
      },
      kind: 'chair',
    },
    {
      name: 'a chair of a gone row',
      selection: {
        kind: 'chair' as const,
        chair: { rowId: 'r9', side: 'front' as const, index: 0 },
      },
      kind: 'plan',
    },
  ])('$name', ({ selection, kind }) => {
    expect(inspectorTargetOf(document, selection).kind).toBe(kind);
  });
});

describe('pruneSelection', () => {
  it.each([
    { name: 'keeps existing rows', selection: rows('r1', 'r3'), next: rows('r1', 'r3') },
    { name: 'drops gone rows', selection: rows('r1', 'r9'), next: rows('r1') },
    { name: 'empties to none', selection: rows('r9'), next: none },
    {
      name: 'drops a chair of a gone row',
      selection: {
        kind: 'chair' as const,
        chair: { rowId: 'r9', side: 'front' as const, index: 0 },
      },
      next: none,
    },
  ])('$name', ({ selection, next }) => {
    expect(pruneSelection(document, selection)).toEqual(next);
  });
});
