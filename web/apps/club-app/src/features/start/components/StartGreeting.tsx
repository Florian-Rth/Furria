import { KkGreetingSkeleton } from '@furria/ui';
import type { FC } from 'react';
import { useGreeting } from '../hooks/use-greeting';
import { GreetingBoard } from './GreetingBoard';

export const StartGreeting: FC = () => {
  const greeting = useGreeting();

  if (greeting === null) {
    return <KkGreetingSkeleton />;
  }

  return <GreetingBoard greeting={greeting} />;
};
