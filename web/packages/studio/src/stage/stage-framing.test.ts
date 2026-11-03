import { describe, expect, it } from 'vitest';
import { containedFrontOf, containedPlaneOf, placeOf } from './stage-framing';

describe('containedPlaneOf', () => {
  it('centres the framed part of the stage in the container', () => {
    const plane = containedPlaneOf(
      { left: 0.5, top: 0, width: 0.5, height: 0.5 },
      { widthMetres: 10, depthMetres: 8 },
      'dancers',
    );

    expect(plane).toEqual({
      '--kk-stage-metre':
        'min(calc((100cqw - 2 * 1.25rem) / 5), calc((100cqh - 1rem - 1.25rem) / 4))',
      width: 'calc(var(--kk-stage-metre) * 10)',
      height: 'calc(var(--kk-stage-metre) * 8)',
      left: 'calc(50cqw - var(--kk-stage-metre) * 7.5)',
      top: 'calc(1rem + (100cqh - 1rem) / 2 - var(--kk-stage-metre) * 2)',
    });
  });

  it('leaves no front room above the stage seen from the audience', () => {
    const plane = containedPlaneOf(
      { left: 0, top: 0, width: 1, height: 1 },
      { widthMetres: 10, depthMetres: 8 },
      'audience',
    );

    expect(plane.top).toBe('calc(0px + (100cqh - 1rem) / 2 - var(--kk-stage-metre) * 4)');
  });
});

describe('containedFrontOf', () => {
  it.each([
    ['dancers', 'max(0px, calc((100cqh - 1rem) / 2 - var(--kk-stage-metre) * 4))'],
    ['audience', 'min(calc(100cqh - 1rem), calc((100cqh - 1rem) / 2 + var(--kk-stage-metre) * 4))'],
  ] as const)('puts the front label on the front edge seen by the %s', (viewpoint, top) => {
    const front = containedFrontOf(
      { left: 0, top: 0, width: 1, height: 1 },
      { widthMetres: 10, depthMetres: 8 },
      viewpoint,
    );

    expect(front.top).toBe(top);
  });
});

describe('placeOf', () => {
  it('centres an item on its stage share', () => {
    expect(placeOf(0.25, 0.5)).toEqual({
      transform: 'translate3d(calc(25cqw - 50%), calc(50cqh - 50%), 0)',
    });
  });
});
