import { useState } from 'react';

export type HoldingTask = 'end' | 'edit';

export type HoldingFormTarget =
  | { mode: 'open'; roleId: number }
  | { mode: HoldingTask; roleId: number; roleHoldingId: number };

export interface HoldingFormTargetControl {
  target: HoldingFormTarget | null;
  openHolding: (roleId: number) => void;
  takeUpHolding: (roleId: number, roleHoldingId: number, task: HoldingTask) => void;
  close: () => void;
}

export const useHoldingFormTarget = (): HoldingFormTargetControl => {
  const [target, setTarget] = useState<HoldingFormTarget | null>(null);

  return {
    target,
    openHolding: (roleId) => {
      setTarget({ mode: 'open', roleId });
    },
    takeUpHolding: (roleId, roleHoldingId, task) => {
      setTarget({ mode: task, roleId, roleHoldingId });
    },
    close: () => {
      setTarget(null);
    },
  };
};
