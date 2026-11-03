import { describe, expect, it } from 'vitest';
import { stageGridOf } from './stage-grid';

describe('stageGridOf', () => {
  it('draws metre lines from the centre across and from the front in depth', () => {
    expect(stageGridOf({ widthMetres: 3, depthMetres: 2 }, false)).toEqual([
      { key: 'x-4', axis: 'x', at: 0.5 / 3, kind: 'metre' },
      { key: 'x0', axis: 'x', at: 0.5, kind: 'metre' },
      { key: 'x4', axis: 'x', at: 2.5 / 3, kind: 'metre' },
      { key: 'y4', axis: 'y', at: 0.5, kind: 'metre' },
    ]);
  });

  it('adds the quarter metres when zoomed in', () => {
    expect(
      stageGridOf({ widthMetres: 1, depthMetres: 0.5 }, true).map((line) => [line.at, line.kind]),
    ).toEqual([
      [0.25, 'quarter'],
      [0.5, 'metre'],
      [0.75, 'quarter'],
      [0.5, 'quarter'],
    ]);
  });
});
