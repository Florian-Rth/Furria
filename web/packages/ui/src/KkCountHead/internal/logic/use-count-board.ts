import type { MotionValue } from 'motion/react';
import { animate, useMotionValue } from 'motion/react';
import { useLayoutEffect, useState } from 'react';
import type { FlapTileTone } from '../../../internal/flap/FlapTile';
import type { KkGreetingBeat } from '../../../KkGreeting/internal/logic/greeting-context';
import type { GreetingPhase } from '../../../KkGreeting/internal/logic/greeting-cues';
import { kkTokens } from '../../../tokens';
import type { CountCell, CountRun } from './count-run';
import {
  arrivalRunOf,
  BLANK_FACE,
  countCellsOf,
  markRevealAtOf,
  tickRunOf,
  turnedTilesOf,
} from './count-run';

export interface CountTurn {
  key: string;
  run: CountRun;
  clock: MotionValue<number>;
}

export type CountCellView =
  | { kind: 'tile'; key: string; face: string; blank: boolean; turn: CountTurn | null }
  | { kind: 'mark'; key: string; face: string; reveal: CountReveal };

export type CountReveal = { kind: 'hidden' } | { kind: 'shown' } | { kind: 'landing'; at: number };

export interface CountBoard {
  cells: CountCellView[];
  tone: FlapTileTone;
  clock: MotionValue<number>;
}

interface CountTick {
  id: number;
  from: string;
}

const { finalMs } = kkTokens.motion.flap;
const MS_PER_SECOND = 1000;

const faceAt = (numeral: string, index: number): string => Array.from(numeral)[index] ?? BLANK_FACE;

interface TurnSource {
  cell: Extract<CountCell, { kind: 'tile' }>;
  index: number;
  phase: GreetingPhase;
  tick: CountTick | null;
  turned: boolean[] | null;
  arrivalClock: MotionValue<number>;
  tickClock: MotionValue<number>;
}

const turnOf = ({
  cell,
  index,
  phase,
  tick,
  turned,
  arrivalClock,
  tickClock,
}: TurnSource): CountTurn | null => {
  if (tick !== null && turned?.[index] === true) {
    return {
      key: `tick-${tick.id}`,
      run: tickRunOf(faceAt(tick.from, index), cell.face),
      clock: tickClock,
    };
  }
  if (tick === null && phase === 'playing') {
    return {
      key: `arrive-${cell.face}`,
      run: arrivalRunOf(cell.face, cell.order),
      clock: arrivalClock,
    };
  }

  return null;
};

const HIDDEN: CountReveal = { kind: 'hidden' };
const SHOWN: CountReveal = { kind: 'shown' };

const revealOf = (phase: GreetingPhase, ticking: boolean, at: number): CountReveal => {
  if (phase === 'waiting') {
    return HIDDEN;
  }

  return phase === 'playing' && !ticking ? { kind: 'landing', at } : SHOWN;
};

export const useCountBoard = (numeral: string, beat: KkGreetingBeat): CountBoard => {
  const { phase, clock, festive } = beat;
  const tickClock = useMotionValue(0);
  const [shown, setShown] = useState(numeral);
  const [tick, setTick] = useState<CountTick | null>(null);

  if (shown !== numeral) {
    setShown(numeral);
    setTick(
      phase === 'settled' && turnedTilesOf(shown, numeral) !== null
        ? { id: (tick?.id ?? 0) + 1, from: shown }
        : null,
    );
  }

  useLayoutEffect(() => {
    if (tick === null) {
      return;
    }

    tickClock.jump(0);
    const controls = animate(tickClock, finalMs, {
      duration: finalMs / MS_PER_SECOND,
      ease: 'linear',
      onComplete: () => {
        setTick(null);
      },
    });

    return () => {
      controls.stop();
    };
  }, [tick, tickClock]);

  const turned = tick === null ? null : turnedTilesOf(tick.from, numeral);
  const placed = countCellsOf(numeral);
  const cells = placed.map((cell, index): CountCellView => {
    const key = `${index}`;

    if (cell.kind === 'mark') {
      const reveal = revealOf(phase, tick !== null, markRevealAtOf(placed, index));

      return { kind: 'mark', key, face: cell.face, reveal };
    }

    return {
      kind: 'tile',
      key,
      face: cell.face,
      blank: phase === 'waiting',
      turn: turnOf({ cell, index, phase, tick, turned, arrivalClock: clock, tickClock }),
    };
  });

  return { cells, tone: festive ? 'gold' : 'deep', clock };
};
