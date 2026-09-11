import { describe, expect, it } from 'vitest';
import { buildAvatarStack } from './avatar-stack';

describe('buildAvatarStack', () => {
  it('shows everyone while the stack fits', () => {
    const plan = buildAvatarStack(['AB', 'CD', 'EF'], 4);

    expect(plan.circles.map((circle) => circle.initials)).toEqual(['AB', 'CD', 'EF']);
    expect(plan.overflowLabel).toBeNull();
  });

  it('shows no overflow when the count lands exactly on the cap', () => {
    expect(buildAvatarStack(['AB', 'CD', 'EF', 'GH'], 4).overflowLabel).toBeNull();
  });

  it('gives up one circle to the overflow bubble so the cap is never exceeded', () => {
    const plan = buildAvatarStack(['AB', 'CD', 'EF', 'GH', 'IJ', 'KL'], 4);

    expect(plan.circles.map((circle) => circle.initials)).toEqual(['AB', 'CD', 'EF']);
    expect(plan.overflowLabel).toBe('+3');
  });

  it('accounts for every person between the circles and the bubble', () => {
    const people = ['AB', 'CD', 'EF', 'GH', 'IJ', 'KL', 'MN'];
    const plan = buildAvatarStack(people, 5);

    expect(plan.circles).toHaveLength(4);
    expect(plan.overflowLabel).toBe('+3');
  });

  it('clamps a nonsensical cap instead of rendering a negative stack', () => {
    expect(buildAvatarStack(['AB', 'CD', 'EF'], 0)).toEqual({
      circles: [],
      overflowLabel: '+3',
    });
  });

  it('keys repeated initials apart', () => {
    expect(buildAvatarStack(['AB', 'AB'], 4).circles.map((circle) => circle.key)).toEqual([
      '0-AB',
      '1-AB',
    ]);
  });

  it('renders nothing for an empty group', () => {
    expect(buildAvatarStack([], 4)).toEqual({ circles: [], overflowLabel: null });
  });
});
