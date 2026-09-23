import { describe, expect, it } from 'vitest';
import { buildDockChips } from './dock-chips';

const COUNTS = { behind: 7, front: 16 };

describe('buildDockChips', () => {
  it('is deterministic for a given seed', () => {
    expect(buildDockChips(COUNTS, 4)).toEqual(buildDockChips(COUNTS, 4));
  });

  it.each([
    { layer: 'behind', expected: 7 },
    { layer: 'front', expected: 16 },
  ])('builds $expected chips $layer the glass', ({ layer, expected }) => {
    const chips = buildDockChips(COUNTS, 4).filter((chip) => chip.layer === layer);

    expect(chips).toHaveLength(expected);
  });

  it('gives every chip its own id', () => {
    const ids = buildDockChips(COUNTS, 4).map((chip) => chip.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each([
    { index: 0, direction: -1 },
    { index: 1, direction: -1 },
    { index: 3, direction: 1 },
    { index: 6, direction: 1 },
  ])('flings behind chip $index in direction $direction', ({ index, direction }) => {
    const chip = buildDockChips(COUNTS, 4)[index];

    expect(Math.sign(chip?.driftX ?? 0)).toBe(direction);
  });

  it.each([0, 3, 6])('keeps behind chip %i inside the pane band', (index) => {
    const chip = buildDockChips(COUNTS, 4)[index];

    expect(chip?.peakY ?? 0).toBeGreaterThanOrEqual(-8);
    expect(chip?.fallY ?? 0).toBeLessThanOrEqual(36);
  });
});
