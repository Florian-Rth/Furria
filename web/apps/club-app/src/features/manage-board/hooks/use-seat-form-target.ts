import { useState } from 'react';

export type SeatFormTarget =
  | { mode: 'open'; boardOfficeId: number; sinceOn: string }
  | { mode: 'end'; boardOfficeId: number; boardSeatId: number };

export interface SeatFormTargetControl {
  target: SeatFormTarget | null;
  openSeat: (boardOfficeId: number, sinceOn: string) => void;
  endSeat: (boardOfficeId: number, boardSeatId: number) => void;
  close: () => void;
}

export const useSeatFormTarget = (): SeatFormTargetControl => {
  const [target, setTarget] = useState<SeatFormTarget | null>(null);

  return {
    target,
    openSeat: (boardOfficeId, sinceOn) => {
      setTarget({ mode: 'open', boardOfficeId, sinceOn });
    },
    endSeat: (boardOfficeId, boardSeatId) => {
      setTarget({ mode: 'end', boardOfficeId, boardSeatId });
    },
    close: () => {
      setTarget(null);
    },
  };
};
