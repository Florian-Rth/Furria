import { countSheetOf, stepCountCellsOf } from '@furria/studio/step-cards';
import { describe, expect, it } from 'vitest';

const marks = [
  { seconds: 1, count: 7 },
  { seconds: 1.5, count: 8 },
  { seconds: 2, count: 1 },
  { seconds: 2.5, count: 2 },
  { seconds: 3, count: 3 },
  { seconds: 3.5, count: 1 },
];

describe('stepCountCellsOf', () => {
  it('lays the step counts into their columns and marks the keyed ones', () => {
    expect(stepCountCellsOf(countSheetOf(marks, [2.6, 9]), { start: 2, end: 3.5 })).toEqual([
      { key: '2', index: 2, column: 0, count: 1, eight: 2, seconds: 2, keyed: false },
      { key: '3', index: 3, column: 1, count: 2, eight: 2, seconds: 2.5, keyed: true },
      { key: '4', index: 4, column: 2, count: 3, eight: 2, seconds: 3, keyed: false },
    ]);
  });

  it('has no cells for a step between two counts', () => {
    expect(stepCountCellsOf(countSheetOf(marks, []), { start: 3.1, end: 3.4 })).toEqual([]);
  });
});
