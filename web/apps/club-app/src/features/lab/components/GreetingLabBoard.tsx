import { KkGreetingSkeleton } from '@furria/ui';
import type { FC } from 'react';
import { GreetingBoard } from '@/features/start';
import { useLabGreeting } from '../hooks/use-lab-greeting';
import type { LabGreeting } from '../lab-greetings';

interface GreetingLabBoardProps {
  greeting: LabGreeting;
}

export const GreetingLabBoard: FC<GreetingLabBoardProps> = ({ greeting }) => {
  const view = useLabGreeting(greeting);

  if (view === null) {
    return <KkGreetingSkeleton />;
  }

  return <GreetingBoard greeting={view} />;
};
