import { useState } from 'react';

export interface EjConfirm {
  armed: (key: string) => boolean;
  press: (key: string, run: () => void) => void;
  disarm: () => void;
}

export const useEjConfirm = (): EjConfirm => {
  const [armedKey, setArmedKey] = useState<string | null>(null);

  return {
    armed: (key) => armedKey === key,
    press: (key, run) => {
      if (armedKey !== key) {
        setArmedKey(key);
        return;
      }
      setArmedKey(null);
      run();
    },
    disarm: () => {
      setArmedKey(null);
    },
  };
};
