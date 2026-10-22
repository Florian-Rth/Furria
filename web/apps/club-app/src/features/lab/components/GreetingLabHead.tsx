import type { FC } from 'react';
import { StartHead } from '@/features/start/components/StartHead';
import { useLabHead } from '../hooks/use-lab-head';
import type { LabGreeting } from '../lab-greetings';

interface GreetingLabHeadProps {
  greeting: LabGreeting;
}

export const GreetingLabHead: FC<GreetingLabHeadProps> = ({ greeting }) => {
  const view = useLabHead(greeting);

  return <StartHead view={view} />;
};
