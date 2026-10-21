import { describe, expect, it } from 'vitest';
import {
  calibrateMotionSign,
  globeGravityOf,
  motionGravity,
  orientationGravity,
  toScreenGravity,
} from './globe-tilt';

const near = (actual: { x: number; y: number }, x: number, y: number): void => {
  expect(actual.x).toBeCloseTo(x, 5);
  expect(actual.y).toBeCloseTo(y, 5);
};

describe('orientationGravity', () => {
  it.each([
    { beta: 90, gamma: 0, x: 0, y: 1 },
    { beta: 0, gamma: 0, x: 0, y: 0 },
    { beta: 0, gamma: 90, x: 1, y: 0 },
    { beta: 0, gamma: -90, x: -1, y: 0 },
    { beta: -90, gamma: 0, x: 0, y: -1 },
    { beta: 30, gamma: 0, x: 0, y: 0.5 },
  ])('beta $beta gamma $gamma pulls toward ($x, $y)', ({ beta, gamma, x, y }) => {
    near(orientationGravity(beta, gamma), x, y);
  });
});

describe('motionGravity', () => {
  it.each([
    { right: 0, top: 9.81, sign: 1 as const, x: 0, y: 1 },
    { right: 9.81, top: 0, sign: 1 as const, x: -1, y: 0 },
    { right: 0, top: -9.81, sign: -1 as const, x: 0, y: 1 },
  ])(
    'reading ($right, $top) with sign $sign pulls toward ($x, $y)',
    ({ right, top, sign, x, y }) => {
      near(motionGravity(right, top, sign), x, y);
    },
  );
});

describe('toScreenGravity', () => {
  it.each([
    { angle: 0, device: { x: 0, y: 1 }, x: 0, y: 1 },
    { angle: 90, device: { x: 1, y: 0 }, x: 0, y: 1 },
    { angle: 270, device: { x: -1, y: 0 }, x: 0, y: 1 },
    { angle: 180, device: { x: 0, y: -1 }, x: 0, y: 1 },
    { angle: -90, device: { x: -1, y: 0 }, x: 0, y: 1 },
    { angle: 90, device: { x: 0, y: 1 }, x: -1, y: 0 },
  ])('screen angle $angle maps device ($device.x, $device.y)', ({ angle, device, x, y }) => {
    near(toScreenGravity(device, angle), x, y);
  });
});

describe('globeGravityOf', () => {
  it.each([
    { screen: { x: 0, y: 0 }, x: 0, y: 0.35 },
    { screen: { x: 0.1, y: 0 }, x: 0.1, y: 0.25 },
    { screen: { x: 0, y: 2 }, x: 0, y: 1 },
    { screen: { x: -0.6, y: 0.6 }, x: -0.6, y: 0.6 },
  ])('keeps a usable pull for ($screen.x, $screen.y)', ({ screen, x, y }) => {
    near(globeGravityOf(screen), x, y);
  });
});

describe('calibrateMotionSign', () => {
  it.each([
    { motion: { x: 0, y: -1 }, orientation: { x: 0, y: 1 }, current: 1 as const, sign: -1 },
    { motion: { x: 0, y: 1 }, orientation: { x: 0, y: 1 }, current: -1 as const, sign: 1 },
    { motion: { x: 0, y: 0.1 }, orientation: { x: 0, y: 1 }, current: -1 as const, sign: -1 },
    { motion: { x: 1, y: 0 }, orientation: { x: 0, y: 1 }, current: 1 as const, sign: 1 },
  ])('settles on $sign', ({ motion, orientation, current, sign }) => {
    expect(calibrateMotionSign(motion, orientation, current)).toBe(sign);
  });
});
