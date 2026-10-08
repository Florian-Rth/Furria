import { describe, expect, it } from 'vitest';
import { buildAvatarStack } from './avatar-stack';

describe('buildAvatarStack', () => {
  it.each([
    { initials: ['AB', 'CD', 'EF', 'GH'], max: 4, total: undefined, shown: 4, overflow: null },
    {
      initials: ['AB', 'CD', 'EF', 'GH', 'IJ', 'KL'],
      max: 4,
      total: undefined,
      shown: 3,
      overflow: '+3',
    },
    { initials: ['AB', 'CD', 'EF'], max: 0, total: undefined, shown: 0, overflow: '+3' },
    { initials: [], max: 4, total: undefined, shown: 0, overflow: null },
    { initials: ['AB', 'CD', 'EF', 'GH', 'IJ'], max: 3, total: 16, shown: 3, overflow: '+13' },
    { initials: ['AB', 'CD'], max: 3, total: 2, shown: 2, overflow: null },
    { initials: ['AB', 'CD', 'EF'], max: 5, total: 1, shown: 3, overflow: null },
  ])(
    'shows $shown circles and $overflow for $initials.length people capped at $max of $total',
    ({ initials, max, total, shown, overflow }) => {
      const plan = buildAvatarStack(initials, max, total);

      expect(plan.circles).toHaveLength(shown);
      expect(plan.overflowLabel).toBe(overflow);
    },
  );

  it('cuts every stacked monogram to one glyph', () => {
    const plan = buildAvatarStack(['ÖH', 'Kü', ''], 4);

    expect(plan.circles.map((circle) => circle.initials)).toEqual(['Ö', 'K', '']);
  });
});
