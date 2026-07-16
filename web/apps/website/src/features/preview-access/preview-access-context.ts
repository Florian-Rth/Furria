import { createContext } from 'react';
import type { PreviewAccessValue } from './types';

export const PreviewAccessContext = createContext<PreviewAccessValue | null>(null);
