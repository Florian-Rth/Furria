import { createContext } from 'react';

export interface PreviewAccessValue {
  granted: boolean;
  grantAccess: () => void;
}

export const PreviewAccessContext = createContext<PreviewAccessValue | null>(null);
