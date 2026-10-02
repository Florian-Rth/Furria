import { createContext, useContext, useLayoutEffect, useState } from 'react';

export interface ScreenArrival {
  hold: () => () => void;
}

export interface ScreenArrivalGate {
  held: boolean;
  arrival: ScreenArrival;
}

const NO_RELEASE = (): void => undefined;
const NO_GATE: ScreenArrival = { hold: () => NO_RELEASE };

export const ScreenArrivalContext = createContext<ScreenArrival>(NO_GATE);

export const useScreenArrivalGate = (): ScreenArrivalGate => {
  const [holds, setHolds] = useState(0);
  const [arrival] = useState<ScreenArrival>(() => ({
    hold: () => {
      setHolds((count) => count + 1);

      return () => {
        setHolds((count) => Math.max(0, count - 1));
      };
    },
  }));

  return { held: holds > 0, arrival };
};

export const useScreenArrivalHold = (held: boolean): void => {
  const { hold } = useContext(ScreenArrivalContext);

  useLayoutEffect(() => (held ? hold() : undefined), [held, hold]);
};
