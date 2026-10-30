import { describe, expect, it } from 'vitest';
import type { TimedKeyframe } from '@/features/act-player/choreography-motion';
import type { StudioStage } from '@/features/acts/schemas';
import { cameraOf, reachOf, WHOLE_STAGE } from './way-camera';

const stage: StudioStage = { widthMetres: 10, depthMetres: 10, artworkSvg: null };

const at = (seconds: number, rightMetres: number, backMetres: number): TimedKeyframe => ({
  seconds,
  position: { rightMetres, backMetres },
  bend: null,
  easing: 'linear',
  facingDegrees: null,
});

describe('cameraOf', () => {
  it('shows the whole stage when there is nothing to follow', () => {
    expect(cameraOf([], stage)).toEqual(WHOLE_STAGE);
  });

  it('shows the whole stage when the way spans it', () => {
    expect(
      cameraOf(
        [
          { x: 0.1, y: 0.1 },
          { x: 0.9, y: 0.9 },
        ],
        stage,
      ),
    ).toEqual(WHOLE_STAGE);
  });

  it('shows the whole stage while you stay on your spot', () => {
    expect(cameraOf([{ x: 0.5, y: 0.5 }], stage)).toEqual(WHOLE_STAGE);
  });

  it('comes closest on a short way', () => {
    expect(
      cameraOf(
        [
          { x: 0.45, y: 0.5 },
          { x: 0.55, y: 0.5 },
        ],
        stage,
      ),
    ).toEqual({ scale: 1.7, x: -0.35, y: -0.35 });
  });

  it('keeps the stage edge in the frame when you move along it', () => {
    const camera = cameraOf(
      [
        { x: 0, y: 0 },
        { x: 0.1, y: 0 },
      ],
      stage,
    );

    expect(camera.x).toBeCloseTo(0);
    expect(camera.y).toBeCloseTo(0);
  });

  it('frames a short way between its ends', () => {
    expect(
      cameraOf(
        [
          { x: 0.2, y: 0.5 },
          { x: 0.6, y: 0.5 },
        ],
        stage,
      ),
    ).toEqual({ scale: 1.55, x: -0.12, y: -0.275 });
  });
});

describe('reachOf', () => {
  it('reaches nowhere without a range', () => {
    expect(reachOf([at(0, 1, 1)], null, stage)).toEqual([]);
  });

  it('covers every place you pass within the range', () => {
    const reach = reachOf([at(0, 0, 0), at(4, 4, 0)], { start: 0, end: 4 }, stage);
    const xs = reach.map((share) => share.x);

    expect(reach).toHaveLength(9);
    expect(Math.min(...xs)).toBeCloseTo(0.1);
    expect(Math.max(...xs)).toBeCloseTo(0.5);
  });
});
