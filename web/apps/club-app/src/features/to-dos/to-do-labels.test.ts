import { describe, expect, it } from 'vitest';
import type { ToDoCount } from './to-do-labels';
import { toToDoLabel } from './to-do-labels';

describe('toToDoLabel', () => {
  it.each<{ singular: ToDoCount; plural: ToDoCount }>([
    { singular: { kind: 'reminderDue', count: 1 }, plural: { kind: 'reminderDue', count: 12 } },
    {
      singular: { kind: 'birthDateUnknown', count: 1 },
      plural: { kind: 'birthDateUnknown', count: 2 },
    },
    { singular: { kind: 'clubRecordGap', count: 1 }, plural: { kind: 'clubRecordGap', count: 3 } },
  ])('names one $singular.kind apart from several', ({ singular, plural }) => {
    expect(toToDoLabel(singular)).not.toBe(toToDoLabel(plural));
  });

  it.each<{ few: ToDoCount; many: ToDoCount }>([
    { few: { kind: 'reminderDue', count: 2 }, many: { kind: 'reminderDue', count: 12 } },
    {
      few: { kind: 'applicationWaiting', count: 2 },
      many: { kind: 'applicationWaiting', count: 40 },
    },
  ])('names every plural count of $few.kind alike', ({ few, many }) => {
    expect(toToDoLabel(few)).toBe(toToDoLabel(many));
  });
});
