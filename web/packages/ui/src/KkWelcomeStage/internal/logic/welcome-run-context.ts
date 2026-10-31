import { createContext, useContext } from 'react';

export interface WelcomeRun {
  leaving: boolean;
}

export const WelcomeRunContext = createContext<WelcomeRun | null>(null);

export const useWelcomeRun = (): WelcomeRun => {
  const run = useContext(WelcomeRunContext);

  if (run === null) {
    throw new Error('A welcome stage part was rendered outside KkWelcomeStage.');
  }

  return run;
};
