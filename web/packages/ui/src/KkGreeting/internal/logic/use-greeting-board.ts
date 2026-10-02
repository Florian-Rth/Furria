import { useEffect, useEffectEvent, useLayoutEffect, useState } from 'react';
import { daySeedOf } from './deck-fit';
import type { FlapCell, KkGreetingPart } from './flap-cells';
import { flapFacesOf, toFlapCells } from './flap-cells';
import type { FlapSchedule, KkGreetingTempo } from './flap-schedule';
import { flapScheduleOf, isTurnRun } from './flap-schedule';
import { sameFaces } from './greeting-board';
import { useGreetingStage } from './greeting-context';
import type { GreetingCue, GreetingPhase } from './greeting-cues';
import { inkCueOf, SHOWN_CUE } from './greeting-cues';
import type { TwinBoard, TwinLayout } from './greeting-twin';
import { dealOf, twinOf } from './greeting-twin';
import { measureGreeting } from './measure-greeting';

export interface GreetingBoardProps {
  parts: readonly KkGreetingPart[];
  previousCells?: readonly string[];
  deck: readonly string[];
  nameDeck?: readonly string[];
  tempo: KkGreetingTempo;
  countFrom?: number;
}

export interface GreetingBoardView {
  cells: FlapCell[];
  cues: GreetingCue[];
  twin: TwinBoard | null;
}

interface GreetingTick {
  id: number;
  schedule: FlapSchedule;
}

interface MeasuredLayout extends TwinLayout {
  id: string;
}

const ARRIVAL = 'arrival';

const twinIdOf = (tick: GreetingTick | null, phase: GreetingPhase): string | null => {
  if (tick !== null) {
    return `tick-${tick.id}`;
  }

  return phase === 'playing' ? ARRIVAL : null;
};

export const useGreetingBoard = ({
  parts,
  previousCells,
  deck,
  nameDeck,
  tempo,
  countFrom,
}: GreetingBoardProps): GreetingBoardView => {
  const { play, festive, night, burst, phase, rootRef, publish, interrupt } = useGreetingStage();
  const cells = toFlapCells(parts);
  const faces = flapFacesOf(cells);
  const [seed] = useState(() => daySeedOf(new Date()));
  const [arrivalCount] = useState(cells.length);
  const [shown, setShown] = useState<readonly string[]>(faces);
  const [tick, setTick] = useState<GreetingTick | null>(null);
  const [layout, setLayout] = useState<MeasuredLayout | null>(null);

  const arrival = flapScheduleOf({
    cells,
    previousCells: previousCells ?? null,
    play,
    festive,
    night,
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
              night,
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
  const turns = active.runs.some(isTurnRun);
  const measuring = twinId !== null && turns ? twinId : null;
  const measured = layout !== null && layout.id === measuring ? layout : null;
  const twin =
    measuring === null || measured === null
      ? null
      : twinOf(measuring, active, cells, measured, seed);

  const measure = useEffectEvent((id: string): void => {
    const root = rootRef.current;
    const reading = root === null ? null : measureGreeting(root);

    if (reading === null) {
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

  useLayoutEffect(() => {
    publish({ schedule: arrival, faces });
  });

  useLayoutEffect(() => {
    if (measuring !== null) {
      measure(measuring);
    }
  }, [measuring]);

  useEffect(() => {
    if (phase === 'playing' && reshaped()) {
      interrupt();
    }
  });

  useEffect(() => {
    if (tick === null) {
      return;
    }

    const timer = window.setTimeout(() => {
      setTick(null);
    }, tick.schedule.duration);

    return () => {
      window.clearTimeout(timer);
    };
  }, [tick]);

  const cues = cells.map((_, index) =>
    tick !== null && twin === null ? SHOWN_CUE : inkCueOf(index, active, activePhase),
  );

  return { cells, cues, twin };
};
