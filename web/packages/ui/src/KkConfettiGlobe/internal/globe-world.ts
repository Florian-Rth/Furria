import { pseudoRandom } from '../../confetti-pieces';
import type { KkGravity } from '../globe-tilt';
import { KK_UPRIGHT } from '../globe-tilt';

export const GLOBE_CAP = 220;
export const GLOBE_STEP_SECONDS = 1 / 120;
export const GLOBE_INK_COUNT = 3;
export const GLOBE_SHAPES = { strip: 0, dot: 1, triangle: 2, chip: 3 } as const;

export interface GlobePane {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly radius: number;
}

const SHAPE_CYCLE = [
  GLOBE_SHAPES.strip,
  GLOBE_SHAPES.dot,
  GLOBE_SHAPES.strip,
  GLOBE_SHAPES.triangle,
  GLOBE_SHAPES.strip,
  GLOBE_SHAPES.chip,
  GLOBE_SHAPES.strip,
  GLOBE_SHAPES.dot,
];
const STRIP_LENGTH = [7, 5] as const;
const STRIP_THICKNESS = [2.4, 1] as const;
const DOT_SIZE = [4, 1.5] as const;
const TRIANGLE_SIZE = [5, 2] as const;
const CHIP_SIZE = [4.5, 1.5] as const;
const BODY = 1.8;
const SHELF_BODY = 1;
const CELL = 8;
const PULL = 1200;
const MIN_FALL_SPEED = 140;
const FALL_SPEED_SPREAD = 120;
const SWAY_SHARE = 0.04;
const MIN_SWAY_SECONDS = 1.5;
const SWAY_SECONDS_SPREAD = 1.5;
const MIN_TURN = 360;
const TURN_SPREAD = 720;
const MIN_TURN_SECONDS = 6;
const TURN_SECONDS_SPREAD = 6;
const RADIANS = Math.PI / 180;
const POUR_LEAD = 6;
const POUR_SPREAD_PER_PIECE = 4;
const MIN_POUR_SPREAD = 30;
const MAX_POUR_SPREAD = 300;
const POUR_DRIFT = 30;
const TOSS_SPEED = 1300;
const TOSS_SPREAD = 1100;
const TOSS_SIDEWAYS = 900;
const TOSS_TUMBLE = 5;
const TOSS_SETTLES_BACK = 0.5;
const TUMBLE_RELAX = 1.2;
const SUPPORTING = -0.3;
const SHELF_GRIP = 0.18;
const HEAP_GRIP = 0.05;
const STICK_SPEED = 25;
const STICK_DAMPING = 12;
const SLIDE_DAMPING = 1.2;
const LIE_DOWN = 3;
const GET_UP = 6;
const LANDED_SPIN_EASE = 3;
const QUIET_SPEED = 30;
const STILL_SECONDS = 10;
const CORRECTION_PASSES = 2;
const CEILING_SHARE = 0.5;
const HALF = 0.5;
const NOBODY = -1;
const LANDED_LINE = -1e9;
const LINE_MARGIN = 0.5;
const HEAP = 1;
const SHELF = 2;

export interface GlobeWorld {
  count: number;
  drawn: number;
  width: number;
  height: number;
  top: number;
  floor: number;
  quietSeconds: number;
  panes: readonly GlobePane[];
  readonly x: Float32Array;
  readonly y: Float32Array;
  readonly lastX: Float32Array;
  readonly lastY: Float32Array;
  readonly vx: Float32Array;
  readonly vy: Float32Array;
  readonly line: Float32Array;
  readonly fallDrag: Float32Array;
  readonly length: Float32Array;
  readonly thickness: Float32Array;
  readonly spin: Float32Array;
  readonly spinRate: Float32Array;
  readonly spinBase: Float32Array;
  readonly flipX: Float32Array;
  readonly flipXRate: Float32Array;
  readonly flipXBase: Float32Array;
  readonly flipY: Float32Array;
  readonly flipYRate: Float32Array;
  readonly flipYBase: Float32Array;
  readonly lie: Float32Array;
  readonly swayPhase: Float32Array;
  readonly swayRate: Float32Array;
  readonly swayReach: Float32Array;
  readonly normalX: Float32Array;
  readonly normalY: Float32Array;
  readonly support: Uint8Array;
  readonly shape: Uint8Array;
  readonly ink: Uint8Array;
  readonly entered: Uint8Array;
  readonly rider: Int16Array;
  readonly next: Int32Array;
  columns: number;
  rows: number;
  heads: Int32Array;
}

export const createGlobeWorld = (): GlobeWorld => ({
  count: 0,
  drawn: 0,
  width: 0,
  height: 0,
  top: 0,
  floor: 0,
  quietSeconds: 0,
  panes: [],
  x: new Float32Array(GLOBE_CAP),
  y: new Float32Array(GLOBE_CAP),
  lastX: new Float32Array(GLOBE_CAP),
  lastY: new Float32Array(GLOBE_CAP),
  vx: new Float32Array(GLOBE_CAP),
  vy: new Float32Array(GLOBE_CAP),
  line: new Float32Array(GLOBE_CAP),
  fallDrag: new Float32Array(GLOBE_CAP),
  length: new Float32Array(GLOBE_CAP),
  thickness: new Float32Array(GLOBE_CAP),
  spin: new Float32Array(GLOBE_CAP),
  spinRate: new Float32Array(GLOBE_CAP),
  spinBase: new Float32Array(GLOBE_CAP),
  flipX: new Float32Array(GLOBE_CAP),
  flipXRate: new Float32Array(GLOBE_CAP),
  flipXBase: new Float32Array(GLOBE_CAP),
  flipY: new Float32Array(GLOBE_CAP),
  flipYRate: new Float32Array(GLOBE_CAP),
  flipYBase: new Float32Array(GLOBE_CAP),
  lie: new Float32Array(GLOBE_CAP),
  swayPhase: new Float32Array(GLOBE_CAP),
  swayRate: new Float32Array(GLOBE_CAP),
  swayReach: new Float32Array(GLOBE_CAP),
  normalX: new Float32Array(GLOBE_CAP),
  normalY: new Float32Array(GLOBE_CAP),
  support: new Uint8Array(GLOBE_CAP),
  shape: new Uint8Array(GLOBE_CAP),
  ink: new Uint8Array(GLOBE_CAP),
  entered: new Uint8Array(GLOBE_CAP),
  rider: new Int16Array(GLOBE_CAP).fill(NOBODY),
  next: new Int32Array(GLOBE_CAP),
  columns: 0,
  rows: 0,
  heads: new Int32Array(0),
});

const randomOf = (world: GlobeWorld, offset: number): number => pseudoRandom(world.drawn, offset);

const clamp = (value: number, low: number, high: number): number =>
  Math.min(Math.max(value, low), Math.max(low, high));

const signOf = (value: number): number => (value > HALF ? 1 : -1);

const spread = (range: readonly [number, number], share: number): number =>
  range[0] + range[1] * share;

export const fitGlobe = (world: GlobeWorld, width: number, height: number, inset: number): void => {
  world.width = width;
  world.height = height;
  world.top = 0;
  world.floor = Math.max(height - inset, CELL);
  world.columns = Math.ceil(width / CELL) + 1;
  world.rows = Math.ceil(height / CELL) + 1;
  world.heads = new Int32Array(world.columns * world.rows);
  world.quietSeconds = 0;
};

export const frameGlobe = (world: GlobeWorld, top: number, floor: number): void => {
  world.top = clamp(top, 0, world.height);
  world.floor = clamp(floor, world.top + CELL, world.height);
  world.quietSeconds = 0;
};

export const movePanes = (
  world: GlobeWorld,
  panes: readonly GlobePane[],
  carriedFrom: readonly number[],
): void => {
  const previous = world.panes;
  const nowAt = new Int16Array(previous.length).fill(NOBODY);
  carriedFrom.forEach((from, index) => {
    if (from >= 0 && from < previous.length) {
      nowAt[from] = index;
    }
  });
  for (let index = 0; index < world.count; index += 1) {
    const from = world.rider[index] ?? NOBODY;
    if (from === NOBODY) {
      continue;
    }
    const to = nowAt[from] ?? NOBODY;
    const before = previous[from];
    const after = panes[to];
    if (before === undefined || after === undefined) {
      world.rider[index] = NOBODY;
      continue;
    }
    const dx = after.left - before.left;
    const dy = after.top - before.top;
    world.x[index] = (world.x[index] ?? 0) + dx;
    world.y[index] = (world.y[index] ?? 0) + dy;
    world.lastX[index] = (world.lastX[index] ?? 0) + dx;
    world.lastY[index] = (world.lastY[index] ?? 0) + dy;
    world.rider[index] = to;
  }
  world.panes = panes;
  world.quietSeconds = 0;
};

const shapePiece = (world: GlobeWorld, index: number): void => {
  const shape = SHAPE_CYCLE[world.drawn % SHAPE_CYCLE.length] ?? GLOBE_SHAPES.strip;
  const share = randomOf(world, 18);
  world.shape[index] = shape;
  if (shape === GLOBE_SHAPES.strip) {
    world.length[index] = spread(STRIP_LENGTH, share);
    world.thickness[index] = spread(STRIP_THICKNESS, randomOf(world, 19));
    return;
  }
  const size = spread(
    shape === GLOBE_SHAPES.dot
      ? DOT_SIZE
      : shape === GLOBE_SHAPES.triangle
        ? TRIANGLE_SIZE
        : CHIP_SIZE,
    share,
  );
  world.length[index] = size;
  world.thickness[index] = size;
};

const landingLineOf = (world: GlobeWorld, from: number, share: number): number => {
  const tops = world.panes
    .map((pane) => pane.top)
    .filter((top) => top >= Math.max(from, world.top) && top < world.floor);
  const pick = Math.min(Math.floor(share * (tops.length + 1)), tops.length);
  return (tops[pick] ?? world.floor) - LINE_MARGIN;
};

const pour = (world: GlobeWorld, amount: number): void => {
  const end = Math.min(GLOBE_CAP, world.count + amount);
  const height = clamp(amount * POUR_SPREAD_PER_PIECE, MIN_POUR_SPREAD, MAX_POUR_SPREAD);
  for (let index = world.count; index < end; index += 1) {
    world.drawn += 1;
    const fallSpeed = MIN_FALL_SPEED + randomOf(world, 0) * FALL_SPEED_SPREAD;
    const turnSeconds = MIN_TURN_SECONDS + randomOf(world, 1) * TURN_SECONDS_SPREAD;
    const spinRate =
      (signOf(randomOf(world, 2)) * (MIN_TURN + randomOf(world, 3) * TURN_SPREAD) * RADIANS) /
      turnSeconds;
    const flipXRate =
      (signOf(randomOf(world, 4)) * (MIN_TURN + randomOf(world, 5) * TURN_SPREAD) * RADIANS) /
      turnSeconds;
    const flipYRate =
      (signOf(randomOf(world, 6)) * (MIN_TURN + randomOf(world, 7) * TURN_SPREAD) * RADIANS) /
      turnSeconds;
    world.x[index] = randomOf(world, 8) * world.width;
    world.y[index] = world.top - POUR_LEAD - randomOf(world, 9) * height;
    world.lastX[index] = world.x[index] ?? 0;
    world.lastY[index] = world.y[index] ?? 0;
    world.vx[index] = (randomOf(world, 10) - HALF) * POUR_DRIFT;
    world.vy[index] = fallSpeed;
    world.line[index] = landingLineOf(world, world.top, randomOf(world, 11));
    world.fallDrag[index] = PULL / fallSpeed;
    world.spin[index] = randomOf(world, 12) * Math.PI * 2;
    world.spinRate[index] = spinRate;
    world.spinBase[index] = spinRate;
    world.flipX[index] = randomOf(world, 13) * Math.PI * 2;
    world.flipXRate[index] = flipXRate;
    world.flipXBase[index] = flipXRate;
    world.flipY[index] = randomOf(world, 14) * Math.PI * 2;
    world.flipYRate[index] = flipYRate;
    world.flipYBase[index] = flipYRate;
    world.lie[index] = 0;
    world.swayPhase[index] = randomOf(world, 15) * Math.PI * 2;
    world.swayRate[index] =
      Math.PI / (MIN_SWAY_SECONDS + randomOf(world, 16) * SWAY_SECONDS_SPREAD);
    world.swayReach[index] = (randomOf(world, 17) - HALF) * SWAY_SHARE * world.width;
    world.ink[index] = world.drawn % GLOBE_INK_COUNT;
    world.entered[index] = 0;
    world.rider[index] = NOBODY;
    shapePiece(world, index);
  }
  world.count = end;
  world.quietSeconds = 0;
};

const unitOf = (gravity: KkGravity): KkGravity => {
  const magnitude = Math.hypot(gravity.x, gravity.y);
  return magnitude < 1e-3 ? KK_UPRIGHT : { x: gravity.x / magnitude, y: gravity.y / magnitude };
};

const toss = (world: GlobeWorld, gravity: KkGravity): void => {
  const down = unitOf(gravity);
  for (let index = 0; index < world.count; index += 1) {
    if (world.entered[index] === 0) {
      continue;
    }
    world.drawn += 1;
    const lift = TOSS_SPEED + randomOf(world, 0) * TOSS_SPREAD;
    const sideways = (randomOf(world, 1) - HALF) * TOSS_SIDEWAYS;
    const y = world.y[index] ?? 0;
    world.vx[index] = -down.x * lift - down.y * sideways;
    world.vy[index] = -down.y * lift + down.x * sideways;
    world.line[index] =
      randomOf(world, 2) < TOSS_SETTLES_BACK ? y : landingLineOf(world, y, randomOf(world, 3));
    world.spinRate[index] = (world.spinBase[index] ?? 0) * TOSS_TUMBLE;
    world.flipXRate[index] = (world.flipXBase[index] ?? 0) * TOSS_TUMBLE;
    world.flipYRate[index] = (world.flipYBase[index] ?? 0) * TOSS_TUMBLE;
    world.rider[index] = NOBODY;
  }
  world.quietSeconds = 0;
};

export const addToGlobe = (
  world: GlobeWorld,
  amount: number,
  tossed: boolean,
  gravity: KkGravity,
): void => {
  if (tossed) {
    toss(world, gravity);
  }
  pour(world, amount);
};

const flatOf = (angle: number): number => Math.round(angle / Math.PI) * Math.PI;

const tumble = (world: GlobeWorld, index: number, landed: boolean, seconds: number): void => {
  const spinRate = world.spinRate[index] ?? 0;
  const flipXRate = world.flipXRate[index] ?? 0;
  const flipYRate = world.flipYRate[index] ?? 0;
  const spin = (world.spin[index] ?? 0) + spinRate * seconds;
  const flipY = (world.flipY[index] ?? 0) + flipYRate * seconds;
  const lie = world.lie[index] ?? 0;
  world.flipX[index] = (world.flipX[index] ?? 0) + flipXRate * seconds;
  if (landed) {
    const ease = Math.min(1, LANDED_SPIN_EASE * seconds);
    const lying =
      Math.abs(world.normalY[index] ?? 0) >= Math.abs(world.normalX[index] ?? 0)
        ? 0
        : Math.PI * HALF;
    const target = lying + flatOf(spin - lying);
    world.spin[index] = spin + (target - spin) * ease;
    world.flipY[index] = flipY + (flatOf(flipY) - flipY) * ease;
    world.lie[index] = lie + (1 - lie) * Math.min(1, LIE_DOWN * seconds);
    world.spinRate[index] = 0;
    world.flipXRate[index] = 0;
    world.flipYRate[index] = 0;
    return;
  }
  const relax = Math.min(1, TUMBLE_RELAX * seconds);
  world.spin[index] = spin;
  world.flipY[index] = flipY;
  world.lie[index] = lie * Math.max(0, 1 - GET_UP * seconds);
  world.spinRate[index] = spinRate + ((world.spinBase[index] ?? 0) - spinRate) * relax;
  world.flipXRate[index] = flipXRate + ((world.flipXBase[index] ?? 0) - flipXRate) * relax;
  world.flipYRate[index] = flipYRate + ((world.flipYBase[index] ?? 0) - flipYRate) * relax;
};

const fly = (world: GlobeWorld, gravity: KkGravity, seconds: number): void => {
  const down = unitOf(gravity);
  for (let index = 0; index < world.count; index += 1) {
    const entered = world.entered[index] === 1;
    const pullX = entered ? gravity.x : 0;
    const pullY = entered ? gravity.y : 1;
    const landed = world.normalX[index] !== 0 || world.normalY[index] !== 0;
    const drag = world.fallDrag[index] ?? 0;
    const vx = world.vx[index] ?? 0;
    const vy = world.vy[index] ?? 0;
    const nextVx = vx + (pullX * PULL - drag * vx) * seconds;
    const nextVy = vy + (pullY * PULL - drag * vy) * seconds;
    const phase = world.swayPhase[index] ?? 0;
    const nextPhase = phase + (world.swayRate[index] ?? 0) * seconds;
    const sway = landed
      ? 0
      : (world.swayReach[index] ?? 0) * (Math.sin(nextPhase) - Math.sin(phase));
    const x = world.x[index] ?? 0;
    const y = world.y[index] ?? 0;
    world.swayPhase[index] = nextPhase;
    world.lastX[index] = x;
    world.lastY[index] = y;
    world.x[index] = x + nextVx * seconds - down.y * sway;
    world.y[index] = y + nextVy * seconds + down.x * sway;
    tumble(world, index, landed, seconds);
    world.normalX[index] = 0;
    world.normalY[index] = 0;
    world.support[index] = 0;
    if (!landed) {
      world.rider[index] = NOBODY;
    }
    if (!entered && (world.y[index] ?? 0) >= world.top) {
      world.entered[index] = 1;
    }
  }
};

const touch = (
  world: GlobeWorld,
  index: number,
  normalX: number,
  normalY: number,
  down: KkGravity,
  rider: number,
  kind: number,
): void => {
  if (normalX * down.x + normalY * down.y < SUPPORTING) {
    world.normalX[index] = (world.normalX[index] ?? 0) + normalX;
    world.normalY[index] = (world.normalY[index] ?? 0) + normalY;
    world.support[index] = Math.max(world.support[index] ?? 0, kind);
    if (kind === SHELF) {
      world.line[index] = LANDED_LINE;
    }
    world.rider[index] = rider;
  }
};

const cellOf = (world: GlobeWorld, index: number): [number, number] => [
  clamp(Math.floor((world.x[index] ?? 0) / CELL), 0, world.columns - 1),
  clamp(Math.floor((world.y[index] ?? 0) / CELL), 0, world.rows - 1),
];

const fillGrid = (world: GlobeWorld): void => {
  world.heads.fill(NOBODY);
  for (let index = 0; index < world.count; index += 1) {
    if (world.entered[index] === 0) {
      continue;
    }
    const [column, row] = cellOf(world, index);
    const cell = row * world.columns + column;
    world.next[index] = world.heads[cell] ?? NOBODY;
    world.heads[cell] = index;
  }
};

const isPassing = (world: GlobeWorld, index: number): boolean =>
  (world.line[index] ?? 0) > (world.y[index] ?? 0);

const part = (world: GlobeWorld, first: number, second: number, down: KkGravity): void => {
  if (isPassing(world, first) !== isPassing(world, second)) {
    return;
  }
  const dx = (world.x[first] ?? 0) - (world.x[second] ?? 0);
  const dy = (world.y[first] ?? 0) - (world.y[second] ?? 0);
  const reach = BODY * 2;
  const distance = Math.hypot(dx, dy);
  if (distance >= reach || distance < 1e-4) {
    return;
  }
  const normalX = dx / distance;
  const normalY = dy / distance;
  const push = (reach - distance) * HALF;
  world.x[first] = (world.x[first] ?? 0) + normalX * push;
  world.y[first] = (world.y[first] ?? 0) + normalY * push;
  world.x[second] = (world.x[second] ?? 0) - normalX * push;
  world.y[second] = (world.y[second] ?? 0) - normalY * push;
  touch(world, first, normalX, normalY, down, world.rider[second] ?? NOBODY, HEAP);
  touch(world, second, -normalX, -normalY, down, world.rider[first] ?? NOBODY, HEAP);
};

const partNeighbours = (world: GlobeWorld, down: KkGravity): void => {
  for (let index = 0; index < world.count; index += 1) {
    if (world.entered[index] === 0) {
      continue;
    }
    const [column, row] = cellOf(world, index);
    for (let near = Math.max(0, row - 1); near <= Math.min(world.rows - 1, row + 1); near += 1) {
      for (
        let side = Math.max(0, column - 1);
        side <= Math.min(world.columns - 1, column + 1);
        side += 1
      ) {
        let other = world.heads[near * world.columns + side] ?? NOBODY;
        while (other !== NOBODY) {
          if (other > index) {
            part(world, index, other, down);
          }
          other = world.next[other] ?? NOBODY;
        }
      }
    }
  }
};

const pushOutOfPane = (
  world: GlobeWorld,
  index: number,
  pane: GlobePane,
  paneIndex: number,
  down: KkGravity,
): void => {
  const x = world.x[index] ?? 0;
  const y = world.y[index] ?? 0;
  if (
    pane.top < (world.line[index] ?? 0) ||
    x < pane.left - SHELF_BODY ||
    x > pane.right + SHELF_BODY ||
    y < pane.top - SHELF_BODY ||
    y > pane.bottom + SHELF_BODY
  ) {
    return;
  }
  const corner = Math.min(
    pane.radius,
    (pane.right - pane.left) * HALF,
    (pane.bottom - pane.top) * HALF,
  );
  const nearX = clamp(x, pane.left + corner, pane.right - corner);
  const nearY = clamp(y, pane.top + corner, pane.bottom - corner);
  const dx = x - nearX;
  const dy = y - nearY;
  const distance = Math.hypot(dx, dy);
  const reach = corner + SHELF_BODY;
  if (distance > 1e-4) {
    if (distance >= reach) {
      return;
    }
    const normalX = dx / distance;
    const normalY = dy / distance;
    world.x[index] = nearX + normalX * reach;
    world.y[index] = nearY + normalY * reach;
    touch(world, index, normalX, normalY, down, paneIndex, SHELF);
    return;
  }
  const exits = [
    { gap: y - pane.top, normalX: 0, normalY: -1 },
    { gap: pane.bottom - y, normalX: 0, normalY: 1 },
    { gap: x - pane.left, normalX: -1, normalY: 0 },
    { gap: pane.right - x, normalX: 1, normalY: 0 },
  ];
  const exit = exits.reduce((best, candidate) => (candidate.gap < best.gap ? candidate : best));
  world.x[index] = x + exit.normalX * (exit.gap + SHELF_BODY);
  world.y[index] = y + exit.normalY * (exit.gap + SHELF_BODY);
  touch(world, index, exit.normalX, exit.normalY, down, paneIndex, SHELF);
};

const meetPanes = (world: GlobeWorld, down: KkGravity): void => {
  for (let paneIndex = 0; paneIndex < world.panes.length; paneIndex += 1) {
    const pane = world.panes[paneIndex];
    if (pane === undefined) {
      continue;
    }
    for (let index = 0; index < world.count; index += 1) {
      pushOutOfPane(world, index, pane, paneIndex, down);
    }
  }
};

const keepInside = (world: GlobeWorld, down: KkGravity): void => {
  const ceiling = world.top - world.height * CEILING_SHARE;
  const left = SHELF_BODY;
  const right = world.width - SHELF_BODY;
  const bottom = world.floor - SHELF_BODY;
  for (let index = 0; index < world.count; index += 1) {
    const x = world.x[index] ?? 0;
    const y = world.y[index] ?? 0;
    world.lastX[index] = clamp(world.lastX[index] ?? 0, left, right);
    if (x < left) {
      world.x[index] = left;
      touch(world, index, 1, 0, down, NOBODY, SHELF);
    } else if (x > right) {
      world.x[index] = right;
      touch(world, index, -1, 0, down, NOBODY, SHELF);
    }
    if (world.entered[index] === 0 || world.rider[index] !== NOBODY) {
      continue;
    }
    if (y > bottom) {
      world.y[index] = bottom;
      world.lastY[index] = Math.min(world.lastY[index] ?? 0, bottom);
      touch(world, index, 0, -1, down, NOBODY, SHELF);
    } else if (y < ceiling) {
      world.y[index] = ceiling;
      touch(world, index, 0, 1, down, NOBODY, SHELF);
    }
  }
};

const followPositions = (world: GlobeWorld, seconds: number): void => {
  for (let index = 0; index < world.count; index += 1) {
    world.vx[index] = ((world.x[index] ?? 0) - (world.lastX[index] ?? 0)) / seconds;
    world.vy[index] = ((world.y[index] ?? 0) - (world.lastY[index] ?? 0)) / seconds;
  }
};

const grip = (world: GlobeWorld, gravity: KkGravity, seconds: number): void => {
  for (let index = 0; index < world.count; index += 1) {
    const sumX = world.normalX[index] ?? 0;
    const sumY = world.normalY[index] ?? 0;
    const length = Math.hypot(sumX, sumY);
    if (length < 1e-4) {
      continue;
    }
    const normalX = sumX / length;
    const normalY = sumY / length;
    const pressing = -(gravity.x * normalX + gravity.y * normalY);
    const along = Math.hypot(gravity.x + normalX * pressing, gravity.y + normalY * pressing);
    const vx = world.vx[index] ?? 0;
    const vy = world.vy[index] ?? 0;
    const normalSpeed = vx * normalX + vy * normalY;
    const slideX = vx - normalX * normalSpeed;
    const slideY = vy - normalY * normalSpeed;
    const friction = world.support[index] === SHELF ? SHELF_GRIP : HEAP_GRIP;
    const holds = along < friction * pressing;
    const slow = Math.hypot(slideX, slideY) < STICK_SPEED;
    const keep =
      holds && slow ? 0 : Math.max(0, 1 - (holds ? STICK_DAMPING : SLIDE_DAMPING) * seconds);
    world.vx[index] = normalX * normalSpeed + slideX * keep;
    world.vy[index] = normalY * normalSpeed + slideY * keep;
  }
};

const isQuiet = (world: GlobeWorld): boolean => {
  for (let index = 0; index < world.count; index += 1) {
    if (
      world.entered[index] === 0 ||
      Math.hypot(world.vx[index] ?? 0, world.vy[index] ?? 0) > QUIET_SPEED
    ) {
      return false;
    }
  }
  return true;
};

export const stepGlobe = (world: GlobeWorld, gravity: KkGravity, seconds: number): void => {
  const down = unitOf(gravity);
  fly(world, gravity, seconds);
  for (let pass = 0; pass < CORRECTION_PASSES; pass += 1) {
    fillGrid(world);
    partNeighbours(world, down);
    meetPanes(world, down);
    keepInside(world, down);
  }
  followPositions(world, seconds);
  grip(world, gravity, seconds);
  world.quietSeconds = isQuiet(world) ? world.quietSeconds + seconds : 0;
};

export const settleGlobe = (world: GlobeWorld): void => {
  for (let elapsed = 0; elapsed < STILL_SECONDS; elapsed += GLOBE_STEP_SECONDS) {
    stepGlobe(world, KK_UPRIGHT, GLOBE_STEP_SECONDS);
  }
  for (let index = 0; index < world.count; index += 1) {
    world.vx[index] = 0;
    world.vy[index] = 0;
    world.flipY[index] = flatOf(world.flipY[index] ?? 0);
    world.lie[index] = 1;
  }
};
