import { useLayoutEffect } from 'react';
import { registerEdgeFadeProperties } from './register-edge-fade-properties';

export const useEdgeFadeProperties = (): void => {
  useLayoutEffect(() => {
    registerEdgeFadeProperties();
  }, []);
};
