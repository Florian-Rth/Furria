import type { MotionValue } from 'motion/react';
import { animate, useMotionValue } from 'motion/react';
import { useEffect, useEffectEvent, useLayoutEffect, useState } from 'react';
import { daySeedOf } from './deck-fit';
import type { FlapCell, KkGreetingPart } from './flap-cells';
import { boundCellOf, flapFacesOf, toFlapCells } from './flap-cells';
import type { FlapSchedule, KkGreetingTempo } from './flap-schedule';
import { flapScheduleOf } from './flap-schedule';
import { sameFaces } from './greeting-board';
import { useGreetingStage } from './greeting-context';
import type { GreetingCue, GreetingPhase } from './greeting-cues';
import { inkCueOf, SHOWN_CUE } from './greeting-cues';
import type { TwinBoard, TwinLayout } from './greeting-twin';
import { dealOf, twinOf } from './greeting-twin';
import { measureGreeting } from './measure-greeting';

export interface GreetingBoardProps {
  parts: readonly KkGreetingPart[];
  deck: readonly string[];
  nameDeck?: readonly string[];
  tempo: KkGreetingTempo;
  countFrom?: number;
}

export interface GreetingBoardView {
  cells: FlapCell[];
  cues: GreetingCue[];
  twin: TwinBoard | null;
  clock: MotionValue<number>;
  festive: boolean;
}

interface GreetingTick {
  id: number;
  schedule: FlapSchedule;
}

interface MeasuredLayout extends TwinLayout {
  id: string;
}

const ARRIVAL = 'arrival';
const MS_PER_SECOND = 1000;
const UNMEASURED: TwinLayout = { boxes: [], deals: [] };

const twinIdOf = (tick: GreetingTick | null, phase: GreetingPhase): string | null => {
  if (tick !== null) {
    return `tick-${tick.id}`;
  }

  return phase === 'playing' ? ARRIVAL : null;
};

export const useGreetingBoard = ({
  parts,
  deck,
  nameDeck,
  tempo,
  countFrom,
}: GreetingBoardProps): GreetingBoardView => {
  const { play, festive, burst, phase, clock, root, publish, run, interrupt } = useGreetingStage();
  const tickClock = useMotionValue(0);
  const cells = toFlapCells(parts);
  const faces = flapFacesOf(cells);
  const [seed] = useState(() => daySeedOf(new Date()));
  const [arrivalCount] = useState(cells.length);
  const [shown, setShown] = useState<readonly string[]>(faces);
  const [tick, setTick] = useState<GreetingTick | null>(null);
  const [layout, setLayout] = useState<MeasuredLayout | null>(null);

  const arrival = flapScheduleOf({
    cells,
    previousCells: null,
    play,
    festive,
    burst,
    tempo,
    countFrom: countFrom ?? null,
  });

  if (!sameFaces(shown, faces)) {
    setShown(faces);
    setTick(
      play === 'live' && phase === 'settled'
        ? {
            id: (tick?.id ?? 0) + 1,
            schedule: flapScheduleOf({
              cells,
              previousCells: shown,
              play: 'tick',
              festive,
              burst: false,
              tempo,
              countFrom: null,
            }),
          }
        : null,
    );
  }

  const active = tick?.schedule ?? arrival;
  const activePhase: GreetingPhase = tick === null ? phase : 'playing';
  const twinId = twinIdOf(tick, phase);
  const turns = active.runs.length > 0;
  const measuring = twinId !== null && turns ? twinId : null;
  const measured = layout !== null && layout.id === measuring ? layout : null;
  const boarded = measuring === null || measured !== null;
  const arrivalReady = tick === null && phase === 'playing' && boarded;
  const tickReady = tick !== null && boarded;
  const assembled = tick === null;
  const twin =
    measuring === null || measured === null || measured.boxes.length === 0
      ? null
      : twinOf(measuring, active, cells, measured, seed, assembled);

  const measure = useEffectEvent((id: string, within: HTMLDivElement): void => {
    const reading = measureGreeting(within);

    if (reading === null) {
      setLayout({ id, ...UNMEASURED });

      return;
    }

    const decks = { deck, nameDeck: nameDeck ?? null };

    setLayout({
      id,
      boxes: reading.boxes,
      deals: cells.map((cell, index) =>
        dealOf(cell, reading.boxes[index]?.width ?? 0, decks, reading.widthOf),
      ),
    });
  });

  const reshaped = useEffectEvent((): boolean => cells.length !== arrivalCount);

  const runArrival = useEffectEvent((): void => {
    run(arrival.duration);
  });

  useLayoutEffect(() => {
    publish(arrival);
  });

  useLayoutEffect(() => {
    if (measuring !== null && root !== null) {
      measure(measuring, root);
    }
  }, [measuring, root]);

  useLayoutEffect(() => {
    if (arrivalReady) {
      runArrival();
    }
  }, [arrivalReady]);

  useEffect(() => {
    if (phase === 'playing' && reshaped()) {
      interrupt();
    }
  });

  useLayoutEffect(() => {
    if (tick === null || !tickReady) {
      return;
    }

    tickClock.jump(0);
    const controls = animate(tickClock, tick.schedule.duration, {
      duration: tick.schedule.duration / MS_PER_SECOND,
      ease: 'linear',
      onComplete: () => {
        setTick(null);
      },
    });

    return () => {
      controls.stop();
    };
  }, [tick, tickReady, tickClock]);

  const cues = cells.map((_, index) =>
    tick !== null && twin === null
      ? SHOWN_CUE
      : inkCueOf(index, active, activePhase, tick === null ? boundCellOf(cells, index) : null),
  );

  return { cells, cues, twin, clock: tick === null ? clock : tickClock, festive };
};
