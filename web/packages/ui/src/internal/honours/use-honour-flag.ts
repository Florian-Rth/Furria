import { useState } from 'react';

export interface HonourFlag {
  openKey: string | null;
  toggle: (key: string) => void;
  close: () => void;
}

export const useHonourFlag = (): HonourFlag => {
  const [openKey, setOpenKey] = useState<string | null>(null);

  const toggle = (key: string): void => {
    setOpenKey((current) => (current === key ? null : key));
  };

  const close = (): void => {
    setOpenKey(null);
  };

  return { openKey, toggle, close };
};
