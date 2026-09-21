import { describe, expect, it } from 'vitest';
import type { TrainingPreviewRow, TrainingPreviewState } from './schemas';
import {
  toCollisionLine,
  toDefaultTicked,
  toPreviewRowKey,
  toPreviewRows,
  toPreviewSummary,
  toTickedInstants,
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

describe('toPreviewRowKey', () => {
  it('joins the slot and the instant', () => {
    expect(toPreviewRowKey(row(3, '2027-01-05T18:30:00+01:00', 'creatable'))).toBe(
      '3@2027-01-05T18:30:00+01:00',
    );
  });

  it('keeps two slots on one evening apart', () => {
    const first = toPreviewRowKey(row(3, '2027-01-05T18:30:00+01:00', 'creatable'));
    const second = toPreviewRowKey(row(4, '2027-01-05T18:30:00+01:00', 'creatable'));

    expect(first).not.toBe(second);
  });
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

  it('ticks nothing when the rhythm yields nothing', () => {
    expect(toDefaultTicked([]).size).toBe(0);
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
    expect(entries.map((entry) => entry.chip.tone)).toEqual(['green', 'neutral']);
  });
});

describe('toToggledTicks', () => {
  it('adds a key that was not ticked', () => {
    expect([...toToggledTicks(new Set(['a']), 'b')]).toEqual(['a', 'b']);
  });

  it('removes a key that was ticked', () => {
    expect([...toToggledTicks(new Set(['a', 'b']), 'a')]).toEqual(['b']);
  });
});

describe('toPreviewSummary', () => {
  it.each([
    [[], 'Es gibt nichts zu planen.'],
    [['alreadyExists' as const], 'Nichts angehakt — es entsteht kein Termin.'],
    [['creatable' as const], '1 Training entsteht.'],
    [['creatable' as const, 'venueTaken' as const], '2 Trainings entstehen.'],
  ])('counts %j', (states, expected) => {
    const rows = states.map((state, index) =>
      row(1, `2027-01-0${index + 1}T19:30:00+01:00`, state),
    );

    expect(toPreviewSummary(toPreviewRows(rows, toDefaultTicked(rows)))).toBe(expected);
  });
});

describe('toTickedInstants', () => {
  it('carries only the ticked rows', () => {
    const rows = [
      row(1, '2027-01-05T19:30:00+01:00', 'creatable'),
      row(1, '2027-01-12T19:30:00+01:00', 'alreadyExists'),
    ];

    expect(toTickedInstants(toPreviewRows(rows, toDefaultTicked(rows)))).toEqual([
      { groupTrainingSlotId: 1, startsAt: '2027-01-05T19:30:00+01:00' },
    ]);
  });
});

describe('toCollisionLine', () => {
  it('names the Ort and what holds it', () => {
    const taken: TrainingPreviewRow = {
      ...row(1, '2027-01-05T19:30:00+01:00', 'venueTaken'),
      venueCollisions: [
        {
          calendarEntryId: 4,
          title: 'Abendprobe',
          startsAt: '2027-01-05T19:00:00+01:00',
          endsAt: '2027-01-05T21:00:00+01:00',
          ownerGroupName: 'Prinzengarde',
        },
      ],
    };

    expect(toCollisionLine(taken)).toBe('Sporthalle ist belegt: Abendprobe');
  });

  it('stays silent when nothing holds the Ort', () => {
    expect(toCollisionLine(row(1, '2027-01-05T19:30:00+01:00', 'creatable'))).toBeNull();
  });
});
