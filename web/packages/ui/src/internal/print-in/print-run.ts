import { createContext, useContext } from 'react';

export interface PrintRun {
  settled: boolean;
  hidden: boolean;
}

const RUNNING: PrintRun = { settled: false, hidden: false };

export const PrintRunContext = createContext<PrintRun>(RUNNING);

export const usePrintRun = (): PrintRun => useContext(PrintRunContext);
