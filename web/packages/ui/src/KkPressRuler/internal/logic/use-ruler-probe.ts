import type { KeyboardEvent, PointerEvent } from 'react';
import { useState } from 'react';
import type { KkPressRulerLane } from '../../press-ruler-data';
import type { RulerColumn } from './ruler-columns';
import { nearestColumnOf, steppedColumnOf } from './ruler-columns';
import type { LoupeSide } from './ruler-loupe';
import { loupeSideOf } from './ruler-loupe';
import { LOUPE_HEIGHT, LOUPE_LIFT, PROBE_REACH } from './ruler-metrics';

export interface RulerProbe {
  lane: KkPressRulerLane;
  share: number;
  column: RulerColumn | null;
  x: number;
  anchor: number;
  side: LoupeSide;
  rulerLeft: number;
  rulerWidth: number;
}

export interface RulerLaneProbe {
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerCancel: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
  onBlur: () => void;
}

export interface RulerProbeState {
  rootRef: (node: HTMLElement | null) => void;
  probe: RulerProbe | null;
  laneProbeOf: (lane: KkPressRulerLane, columns: readonly RulerColumn[]) => RulerLaneProbe;
}

const ceilingOf = (): number =>
  Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;

const STEP_KEYS: Record<string, 1 | -1> = { ArrowRight: 1, ArrowLeft: -1 };

export const useRulerProbe = (onReveal: (id: string) => void): RulerProbeState => {
  const [root, setRoot] = useState<HTMLElement | null>(null);
  const [probe, setProbe] = useState<RulerProbe | null>(null);
  const [scrubbing, setScrubbing] = useState(false);

  const probeOf = (
    plot: HTMLElement,
    lane: KkPressRulerLane,
    column: RulerColumn | null,
    x: number,
  ): RulerProbe => {
    const plotBox = plot.getBoundingClientRect();
    const rootBox = root?.getBoundingClientRect() ?? plotBox;
    const focusX = column?.x ?? x;
    const side = loupeSideOf(plotBox.top - LOUPE_LIFT, ceilingOf(), LOUPE_HEIGHT);
    const anchor = side === 'above' ? plotBox.top : rootBox.bottom;

    return {
      lane,
      share: plotBox.width === 0 ? 0 : focusX / plotBox.width,
      column,
      x: plotBox.left + focusX,
      anchor,
      side,
      rulerLeft: rootBox.left,
      rulerWidth: rootBox.width,
    };
  };

  const laneProbeOf = (lane: KkPressRulerLane, columns: readonly RulerColumn[]): RulerLaneProbe => {
    const pointerProbeOf = (event: PointerEvent<HTMLDivElement>): RulerProbe => {
      const plot = event.currentTarget;
      const box = plot.getBoundingClientRect();
      const x = Math.min(Math.max(event.clientX - box.left, 0), box.width);

      return probeOf(plot, lane, nearestColumnOf(columns, x, PROBE_REACH), x);
    };

    const onPointerDown = (event: PointerEvent<HTMLDivElement>): void => {
      event.currentTarget.setPointerCapture(event.pointerId);
      setScrubbing(true);
      setProbe(pointerProbeOf(event));
    };

    const onPointerMove = (event: PointerEvent<HTMLDivElement>): void => {
      if (scrubbing) {
        setProbe(pointerProbeOf(event));
      }
    };

    const onPointerUp = (event: PointerEvent<HTMLDivElement>): void => {
      const released = pointerProbeOf(event);
      const first = released.column?.marks[0];

      setScrubbing(false);
      setProbe(null);

      if (first !== undefined) {
        onReveal(first.id);
      }
    };

    const onPointerCancel = (): void => {
      setScrubbing(false);
      setProbe(null);
    };

    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
      const step = STEP_KEYS[event.key];
      const current = probe?.lane.key === lane.key ? probe.column : null;

      if (step !== undefined) {
        event.preventDefault();
        const column = steppedColumnOf(columns, current, step);

        if (column !== null) {
          setProbe(probeOf(event.currentTarget, lane, column, column.x));
        }
        return;
      }

      const first = current?.marks[0];

      if (event.key === 'Enter' && first !== undefined) {
        onReveal(first.id);
      }

      if (event.key === 'Escape') {
        setProbe(null);
      }
    };

    const onBlur = (): void => {
      if (!scrubbing) {
        setProbe(null);
      }
    };

    return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onKeyDown, onBlur };
  };

  return { rootRef: setRoot, probe, laneProbeOf };
};
