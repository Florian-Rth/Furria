import { useState } from 'react';

export interface KeyDialogs {
  handoutVenueId: number | null;
  returnKeyHoldingId: number | null;
  openHandout: (venueId: number) => void;
  openReturn: (keyHoldingId: number) => void;
  close: () => void;
}

type KeyDialogTarget =
  | { kind: 'handout'; venueId: number }
  | { kind: 'return'; keyHoldingId: number };

export const useKeyDialogs = (): KeyDialogs => {
  const [target, setTarget] = useState<KeyDialogTarget | null>(null);

  return {
    handoutVenueId: target?.kind === 'handout' ? target.venueId : null,
    returnKeyHoldingId: target?.kind === 'return' ? target.keyHoldingId : null,
    openHandout: (venueId: number) => {
      setTarget({ kind: 'handout', venueId });
    },
    openReturn: (keyHoldingId: number) => {
      setTarget({ kind: 'return', keyHoldingId });
    },
    close: () => {
      setTarget(null);
    },
  };
};
