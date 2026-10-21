import { describe, expect, it } from 'vitest';
import type { KkGravity } from '../globe-tilt';
import type { GlobePane, GlobeWorld } from './globe-world';
import {
  addToGlobe,
  createGlobeWorld,
  fitGlobe,
  GLOBE_CAP,
  GLOBE_STEP_SECONDS,
  movePanes,
  settleGlobe,
  stepGlobe,
} from './globe-world';

const WIDTH = 390;
const HEIGHT = 844;
const UPRIGHT: KkGravity = { x: 0, y: 1 };
const SHELF: GlobePane = { left: 20, top: 400, right: 370, bottom: 600, radius: 14 };
const LEDGE: GlobePane = { left: 100, top: 400, right: 300, bottom: 600, radius: 14 };

const run = (world: GlobeWorld, gravity: KkGravity, seconds: number): void => {
  for (let elapsed = 0; elapsed < seconds; elapsed += GLOBE_STEP_SECONDS) {
    stepGlobe(world, gravity, GLOBE_STEP_SECONDS);
  }
};

const worldWith = (panes: readonly GlobePane[], amount: number): GlobeWorld => {
  const world = createGlobeWorld();
  fitGlobe(world, WIDTH, HEIGHT, 0);
  movePanes(world, panes, []);
  addToGlobe(world, amount, false, UPRIGHT);
  return world;
};

const xs = (world: GlobeWorld): number[] => Array.from(world.x.subarray(0, world.count));
const ys = (world: GlobeWorld): number[] => Array.from(world.y.subarray(0, world.count));
const mean = (values: readonly number[]): number =>
  values.reduce((sum, value) => sum + value, 0) / values.length;

describe('confetti globe world', () => {
  it('pours every piece in from above the top edge', () => {
    const world = worldWith([], 12);

    expect(world.count).toBe(12);
    expect(Math.max(...ys(world))).toBeLessThan(0);
  });

  it('piles a big pour softly on the floor and comes to rest', () => {
    const world = worldWith([], 140);
    run(world, UPRIGHT, 16);

    expect(Math.max(...ys(world))).toBeLessThanOrEqual(HEIGHT);
    expect(Math.min(...ys(world))).toBeGreaterThan(HEIGHT - 30);
    expect(world.quietSeconds).toBeGreaterThan(0.5);
  });

  it('sprinkles pieces on a pane top and the floor, never inside the pane', () => {
    const world = worldWith([SHELF], 60);
    run(world, UPRIGHT, 16);
    const onShelf = ys(world).filter((y) => y <= SHELF.top && y > SHELF.top - 12).length;
    const onFloor = ys(world).filter((y) => y > HEIGHT - 12).length;

    expect(onShelf).toBeGreaterThan(0);
    expect(onFloor).toBeGreaterThan(0);
    expect(onShelf + onFloor).toBe(60);
  });

  it('keeps a crowded pane top low and spills the rest over its ends', () => {
    const world = worldWith([LEDGE], 220);
    run(world, UPRIGHT, 14);
    const onLedge = ys(world).filter((y) => y <= LEDGE.top);

    expect(Math.min(...onLedge)).toBeGreaterThan(LEDGE.top - 14);
  });

  it('slides pieces off a pane edge when tilted', () => {
    const world = worldWith([LEDGE], 80);
    run(world, UPRIGHT, 10);
    const onLedge = ys(world).filter((y) => y <= LEDGE.top).length;
    run(world, { x: -0.35, y: 0.94 }, 4);

    expect(onLedge).toBeGreaterThan(0);
    expect(ys(world).filter((y) => y <= LEDGE.top).length).toBeLessThan(onLedge);
    expect(Math.min(...xs(world))).toBeGreaterThanOrEqual(0);
  });

  it('keeps a slightly tilted pile in place', () => {
    const world = worldWith([], 140);
    run(world, UPRIGHT, 12);
    const before = mean(xs(world));
    run(world, { x: -0.1, y: 0.99 }, 2);

    expect(Math.abs(mean(xs(world)) - before)).toBeLessThan(6);
  });

  it('carries resting pieces along when their pane scrolls', () => {
    const world = worldWith([SHELF], 20);
    run(world, UPRIGHT, 16);
    const before = ys(world);
    movePanes(world, [{ ...SHELF, top: SHELF.top - 300, bottom: SHELF.bottom - 300 }], [0]);
    const expected = before.map((y) => (y <= SHELF.top ? 300 : 0));

    expect(ys(world).map((y, index) => (before[index] ?? 0) - y)).toEqual(expected);
  });

  it('tosses the pile against gravity and tops it up to the cap', () => {
    const world = worldWith([], 140);
    run(world, UPRIGHT, 12);
    const settledHeight = mean(ys(world));
    for (let shake = 0; shake < 10; shake += 1) {
      addToGlobe(world, 10, true, UPRIGHT);
    }
    run(world, UPRIGHT, 0.15);

    expect(mean(ys(world))).toBeLessThan(settledHeight - 40);
    expect(world.count).toBe(GLOBE_CAP);
  });

  it('settles a still globe straight onto the floor', () => {
    const world = worldWith([], 40);
    settleGlobe(world);

    expect(Math.min(...ys(world))).toBeGreaterThan(HEIGHT - 30);
    expect(Array.from(world.vy.subarray(0, world.count)).every((speed) => speed === 0)).toBe(true);
  });
});
