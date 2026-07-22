import { useLayoutEffect } from 'react';
import { registerChipFadeProperties } from './register-chip-fade-properties';

export const useChipFadeProperties = (): void => {
  useLayoutEffect(() => {
    registerChipFadeProperties();
  }, []);
};
