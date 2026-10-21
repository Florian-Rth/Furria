import { useState } from 'react';

export type HoldingFormTarget =
  | { mode: 'open'; roleId: number }
  | { mode: 'end'; roleId: number; roleHoldingId: number };

export interface HoldingFormTargetControl {
  target: HoldingFormTarget | null;
  openHolding: (roleId: number) => void;
  endHolding: (roleId: number, roleHoldingId: number) => void;
  close: () => void;
}

export const useHoldingFormTarget = (): HoldingFormTargetControl => {
  const [target, setTarget] = useState<HoldingFormTarget | null>(null);

  return {
    target,
    openHolding: (roleId) => {
      setTarget({ mode: 'open', roleId });
    },
    endHolding: (roleId, roleHoldingId) => {
      setTarget({ mode: 'end', roleId, roleHoldingId });
    },
    close: () => {
      setTarget(null);
    },
  };
};
