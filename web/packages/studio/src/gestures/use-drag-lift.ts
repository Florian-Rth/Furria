import { useState } from 'react';
import type { GesturePoint } from './gesture-recogniser';
import type { LiftPlacement, LiftSize, LoupeView } from './lift-placement';
import { liftPlacementOf, loupeOf } from './lift-placement';

export interface DragReadout<Value> {
  value: Value;
  placement: LiftPlacement;
}

export interface DragLift<Value> {
  readout: DragReadout<Value> | null;
  loupe: LoupeView | null;
  show: (finger: GesturePoint, value: Value) => void;
  hide: () => void;
}

interface UseDragLiftOptions {
  area: LiftSize | null;
  readoutSize: LiftSize;
  loupeDiameter?: number;
}

interface Held<Value> {
  finger: GesturePoint;
  value: Value;
}

export const useDragLift = <Value>({
  area,
  readoutSize,
  loupeDiameter,
}: UseDragLiftOptions): DragLift<Value> => {
  const [held, setHeld] = useState<Held<Value> | null>(null);
  const readout =
    held === null || area === null
      ? null
      : { value: held.value, placement: liftPlacementOf(held.finger, area, readoutSize) };
  const loupe =
    held === null || area === null || loupeDiameter === undefined
      ? null
      : loupeOf(held.finger, area, loupeDiameter);

  return {
    readout,
    loupe,
    show: (finger, value) => setHeld({ finger, value }),
    hide: () => setHeld(null),
  };
};
