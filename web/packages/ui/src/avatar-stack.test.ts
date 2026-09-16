import { describe, expect, it } from 'vitest';
import { buildAvatarStack } from './avatar-stack';

describe('buildAvatarStack', () => {
  it('shows everyone while the stack fits', () => {
    const plan = buildAvatarStack(['AB', 'CD', 'EF'], 4);

    expect(plan.circles.map((circle) => circle.initials)).toEqual(['A', 'C', 'E']);
    expect(plan.overflowLabel).toBeNull();
  });

  it('shows no overflow when the count lands exactly on the cap', () => {
    expect(buildAvatarStack(['AB', 'CD', 'EF', 'GH'], 4).overflowLabel).toBeNull();
  });

  it('gives up one circle to the overflow bubble so the cap is never exceeded', () => {
    const plan = buildAvatarStack(['AB', 'CD', 'EF', 'GH', 'IJ', 'KL'], 4);

    expect(plan.circles.map((circle) => circle.initials)).toEqual(['A', 'C', 'E']);
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

  it('cuts every stacked monogram to one glyph so the overlap cannot shave a letter', () => {
    const plan = buildAvatarStack(['ÖH', 'Kü', 'A'], 4);

    expect(plan.circles.map((circle) => circle.initials)).toEqual(['Ö', 'K', 'A']);
  });

  it('survives a person with no initials at all', () => {
    expect(buildAvatarStack([''], 4).circles).toEqual([{ key: '0-', initials: '' }]);
  });

  it('renders nothing for an empty group', () => {
    expect(buildAvatarStack([], 4)).toEqual({ circles: [], overflowLabel: null });
  });

  it('counts the overflow from the group size when a preview is shorter than the group', () => {
    const plan = buildAvatarStack(['AB', 'CD', 'EF', 'GH', 'IJ'], 3, 16);

    expect(plan.circles.map((circle) => circle.initials)).toEqual(['A', 'C', 'E']);
    expect(plan.overflowLabel).toBe('+13');
  });

  it('keeps the cap when the preview is longer than the cap and a size is known', () => {
    expect(buildAvatarStack(['AB', 'CD', 'EF', 'GH', 'IJ'], 5, 5).overflowLabel).toBeNull();
  });

  it('shows no bubble when the known size is already on screen', () => {
    expect(buildAvatarStack(['AB', 'CD'], 3, 2).overflowLabel).toBeNull();
  });

  it('never shows a negative bubble when the known size lags the preview', () => {
    expect(buildAvatarStack(['AB', 'CD', 'EF'], 5, 1).overflowLabel).toBeNull();
  });
});
