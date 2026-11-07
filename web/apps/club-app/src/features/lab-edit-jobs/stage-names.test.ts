import { describe, expect, it } from 'vitest';
import type { StageBox, StageNamePlace, StageNameSpot } from './stage-names';
import { stageNamesOf } from './stage-names';

const stage = { width: 320, height: 230 };
const names = ['Lena', 'Mia', 'Lea', 'Emily', 'Sophie', 'Paula', 'Lina', 'Florian', 'Sabine'];

const boxOf = (spot: StageNameSpot, place: StageNamePlace, box: StageBox) => {
  const width = spot.name.length * (place.size === 'large' ? 8.4 : 7.2) + 10;
  const height = place.size === 'large' ? 20 : 17;
  const x = spot.x * box.width + place.dx;
  const y = spot.y * box.height + place.dy;

  return { left: x - width / 2, right: x + width / 2, top: y - height / 2, bottom: y + height / 2 };
};

const overlaps = (spots: readonly StageNameSpot[], box: StageBox, size: 'large' | 'small') => {
  const places = stageNamesOf(spots, box, size);

  return spots.flatMap((first, at) =>
    spots.slice(at + 1).filter((second) => {
      const one = places.get(first.key);
      const two = places.get(second.key);
      if (one === undefined || two === undefined) {
        return true;
      }
      const a = boxOf(first, one, box);
      const b = boxOf(second, two, box);

      return a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
    }),
  );
};

describe('stageNamesOf', () => {
  it.each([
    [0.02, 0.5],
    [0.98, 0.5],
    [0.5, 0.02],
    [0.97, 0.98],
  ])('keeps the name of a dot at %s/%s inside the stage', (x, y) => {
    const spot = { key: 'a', x, y, name: 'Florian' };
    const place = stageNamesOf([spot], stage, 'small').get('a');
    if (place === undefined) {
      throw new Error('no place');
    }
    const box = boxOf(spot, place, stage);

    expect([
      box.left >= 0,
      box.right <= stage.width,
      box.top >= 0,
      box.bottom <= stage.height,
    ]).toEqual([true, true, true, true]);
  });

  it('puts a lone name right above its dot at the preferred size', () => {
    const places = stageNamesOf([{ key: 'a', x: 0.5, y: 0.5, name: 'Lena' }], stage, 'large');

    expect(places.get('a')).toEqual({ dx: 0, dy: -25, size: 'large' });
  });

  it('keeps every name clear of the others in a row of twelve one metre apart', () => {
    const spots = Array.from({ length: 12 }, (_, at) => ({
      key: String(at),
      x: (at + 0.7) / 12.4,
      y: 0.85,
      name: names[at % names.length] ?? '',
    }));

    expect(overlaps(spots, stage, 'small')).toEqual([]);
  });

  it('keeps every name clear of the others in a circle', () => {
    const spots = Array.from({ length: 12 }, (_, at) => ({
      key: String(at),
      x: 0.5 + 0.28 * Math.cos((at / 12) * 2 * Math.PI),
      y: 0.5 + 0.36 * Math.sin((at / 12) * 2 * Math.PI),
      name: names[at % names.length] ?? '',
    }));

    expect(overlaps(spots, { width: 560, height: 400 }, 'large')).toEqual([]);
  });
});
