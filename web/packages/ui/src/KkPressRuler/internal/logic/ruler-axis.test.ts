import { describe, expect, it } from 'vitest';
import { placedAxisLabelsOf } from './ruler-axis';

describe('placedAxisLabelsOf', () => {
  it('drops a later label that collides with an earlier one and sorts by position', () => {
    const placed = placedAxisLabelsOf(
      [
        { text: '11.11.', share: 0, kind: 'opening' },
        { text: 'Fasching', share: 0.67, kind: 'fest' },
        { text: 'Feb', share: 0.6, kind: 'month' },
        { text: 'Jan', share: 0.3, kind: 'month' },
        { text: 'Dez', share: 0.05, kind: 'month' },
      ],
      300,
    );

    expect(placed.map((label) => label.text)).toEqual(['11.11.', 'Jan', 'Fasching']);
  });

  it('drops a label that would stick out of the plot', () => {
    expect(placedAxisLabelsOf([{ text: 'Fasching', share: 0.99, kind: 'fest' }], 300)).toEqual([]);
  });

  it('ends the summer label at its share', () => {
    expect(placedAxisLabelsOf([{ text: 'Sommer', share: 1, kind: 'summer' }], 300)).toHaveLength(1);
  });
});
