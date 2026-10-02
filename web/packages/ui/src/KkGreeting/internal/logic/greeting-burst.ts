import { pseudoRandom } from '../../../confetti-pieces';

export type GreetingBurstColor = 'red' | 'gold' | 'ink';

export interface GreetingBurstPiece {
  id: number;
  riseX: number;
  riseY: number;
  dropX: number;
  dropY: number;
  spin: number;
  size: number;
  isRound: boolean;
  color: GreetingBurstColor;
  delaySeconds: number;
  durationSeconds: number;
}

const PIECES = 11;
const COLORS: readonly GreetingBurstColor[] = ['red', 'gold', 'ink'];
const FAN_FROM = -165;
const FAN_TO = -15;
const REACH_MIN = 34;
const REACH_SPREAD = 44;
const DRIFT = 1.35;
const FALL_MIN = 28;
const FALL_SPREAD = 36;
const SIZE_MIN = 5;
const SIZE_SPREAD = 5;
const SPIN_MIN = 200;
const SPIN_SPREAD = 340;
const DELAY_SPREAD = 0.06;
const DURATION_MIN = 0.85;
const DURATION_SPREAD = 0.3;
const RADIANS_PER_DEGREE = Math.PI / 180;
const HALF = 0.5;

export const greetingBurstOf = (seed: number): GreetingBurstPiece[] =>
  Array.from({ length: PIECES }, (_, id) => {
    const random = (offset: number): number => pseudoRandom(seed, id * PIECES + offset);
    const share = (id + random(0)) / PIECES;
    const angle = (FAN_FROM + (FAN_TO - FAN_FROM) * share) * RADIANS_PER_DEGREE;
    const reach = REACH_MIN + random(1) * REACH_SPREAD;
    const riseX = Math.cos(angle) * reach;
    const riseY = Math.sin(angle) * reach;

    return {
      id,
      riseX,
      riseY,
      dropX: riseX * DRIFT,
      dropY: riseY + FALL_MIN + random(2) * FALL_SPREAD,
      spin: (random(3) > HALF ? 1 : -1) * (SPIN_MIN + random(4) * SPIN_SPREAD),
      size: SIZE_MIN + random(5) * SIZE_SPREAD,
      isRound: id % 3 === 0,
      color: COLORS[id % COLORS.length] ?? 'red',
      delaySeconds: random(6) * DELAY_SPREAD,
      durationSeconds: DURATION_MIN + random(7) * DURATION_SPREAD,
    };
  });
