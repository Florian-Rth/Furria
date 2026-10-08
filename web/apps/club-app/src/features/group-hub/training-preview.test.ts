import { describe, expect, it } from 'vitest';
import type { TrainingPreviewRow, TrainingPreviewState } from './schemas';
import type { PreviewSummary } from './training-preview';
import {
  previewSummaryOf,
  toDefaultTicked,
  toPreviewRowKey,
  toPreviewRows,
  toTickedAll,
  toToggledTicks,
} from './training-preview';

const row = (
  groupTrainingSlotId: number,
  startsAt: string,
  state: TrainingPreviewState,
): TrainingPreviewRow => ({
  groupTrainingSlotId,
  startsAt,
  endsAt: '2027-01-05T20:00:00+01:00',
  venueId: 7,
  venueName: 'Sporthalle',
  state,
  venueCollisions: [],
});

describe('toDefaultTicked', () => {
  it.each([
    ['creatable' as const, true],
    ['venueTaken' as const, true],
    ['alreadyExists' as const, false],
  ])('ticks %s by default: %s', (state, ticked) => {
    const only = row(1, '2027-01-05T19:30:00+01:00', state);

    expect(toDefaultTicked([only]).has(toPreviewRowKey(only))).toBe(ticked);
  });
});

describe('toPreviewRows', () => {
  it('marks the ticked rows and dims the ones that already stand', () => {
    const rows = [
      row(1, '2027-01-05T19:30:00+01:00', 'creatable'),
      row(1, '2027-01-12T19:30:00+01:00', 'alreadyExists'),
    ];

    const entries = toPreviewRows(rows, toDefaultTicked(rows));

    expect(entries.map((entry) => entry.checked)).toEqual([true, false]);
    expect(entries.map((entry) => entry.dimmed)).toEqual([false, true]);
  });

  it('blocks a row whose venue is archived and refuses a tick it was handed', () => {
    const archived = row(1, '2027-01-05T19:30:00+01:00', 'venueArchived');
    const entries = toPreviewRows([archived], new Set([toPreviewRowKey(archived)]));

    expect(entries.map((entry) => entry.blocked)).toEqual([true]);
    expect(entries.map((entry) => entry.checked)).toEqual([false]);
  });
});

describe('toTickedAll', () => {
  it('leaves the blocked rows out', () => {
    const creatable = row(1, '2027-01-05T19:30:00+01:00', 'creatable');
    const archived = row(1, '2027-01-12T19:30:00+01:00', 'venueArchived');
    const entries = toPreviewRows([creatable, archived], new Set());

    expect([...toTickedAll(entries)]).toEqual([toPreviewRowKey(creatable)]);
  });
});

describe('toToggledTicks', () => {
  it.each([
    ['adds a key that was not ticked', ['a'], 'b', ['a', 'b']],
    ['removes a key that was ticked', ['a', 'b'], 'a', ['b']],
  ])('%s', (_case, ticked, key, expected) => {
    expect([...toToggledTicks(new Set(ticked), key)]).toEqual(expected);
  });
});

describe('previewSummaryOf', () => {
  it.each<[TrainingPreviewState[], PreviewSummary]>([
    [[], { kind: 'empty' }],
    [['alreadyExists'], { kind: 'noneTicked' }],
    [['creatable', 'venueTaken', 'alreadyExists'], { kind: 'ticked', count: 2 }],
  ])('sums up %j', (states, expected) => {
    const rows = states.map((state, index) =>
      row(1, `2027-01-0${index + 1}T19:30:00+01:00`, state),
    );

    expect(previewSummaryOf(toPreviewRows(rows, toDefaultTicked(rows)))).toEqual(expected);
  });
});
