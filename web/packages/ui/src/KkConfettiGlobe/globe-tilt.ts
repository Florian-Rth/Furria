export interface KkGravity {
  readonly x: number;
  readonly y: number;
}

export type KkMotionSign = 1 | -1;

const EARTH = 9.81;
const RADIANS = Math.PI / 180;
const FULL_TURN = 360;
const FLOOR = 0.35;
const AGREEMENT = 0.3;
const TRUSTED_MAGNITUDE = 0.4;
const QUARTER_TURNS: Readonly<Record<number, readonly [number, number]>> = {
  0: [1, 0],
  90: [0, 1],
  180: [-1, 0],
  270: [0, -1],
};

export const KK_UPRIGHT: KkGravity = { x: 0, y: 1 };

const magnitudeOf = (gravity: KkGravity): number => Math.hypot(gravity.x, gravity.y);

export const orientationGravity = (beta: number, gamma: number): KkGravity => ({
  x: Math.cos(beta * RADIANS) * Math.sin(gamma * RADIANS),
  y: Math.sin(beta * RADIANS),
});

export const motionGravity = (
  towardRight: number,
  towardTop: number,
  sign: KkMotionSign,
): KkGravity => ({
  x: (-towardRight * sign) / EARTH,
  y: (towardTop * sign) / EARTH,
});

const turnOf = (angle: number): readonly [number, number] => {
  const normalized = ((Math.round(angle) % FULL_TURN) + FULL_TURN) % FULL_TURN;
  return (
    QUARTER_TURNS[normalized] ?? [Math.cos(normalized * RADIANS), Math.sin(normalized * RADIANS)]
  );
};

export const toScreenGravity = (device: KkGravity, screenAngle: number): KkGravity => {
  const [cos, sin] = turnOf(screenAngle);
  return {
    x: device.x * cos - device.y * sin,
    y: device.x * sin + device.y * cos,
  };
};

export const globeGravityOf = (screen: KkGravity): KkGravity => {
  const magnitude = magnitudeOf(screen);
  if (magnitude > 1) {
    return { x: screen.x / magnitude, y: screen.y / magnitude };
  }
  if (magnitude < FLOOR) {
    return { x: screen.x, y: screen.y + FLOOR - magnitude };
  }
  return screen;
};

export const calibrateMotionSign = (
  motion: KkGravity,
  orientation: KkGravity,
  current: KkMotionSign,
): KkMotionSign => {
  const motionMagnitude = magnitudeOf(motion);
  const orientationMagnitude = magnitudeOf(orientation);
  if (motionMagnitude < TRUSTED_MAGNITUDE || orientationMagnitude < TRUSTED_MAGNITUDE) {
    return current;
  }
  const agreement =
    (motion.x * orientation.x + motion.y * orientation.y) /
    (motionMagnitude * orientationMagnitude);
  if (agreement < -AGREEMENT) {
    return -1;
  }
  if (agreement > AGREEMENT) {
    return 1;
  }
  return current;
};

export const easeGravity = (previous: KkGravity, next: KkGravity, share: number): KkGravity => ({
  x: previous.x + (next.x - previous.x) * share,
  y: previous.y + (next.y - previous.y) * share,
});
