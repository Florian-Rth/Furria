import { KkFactRow, KkPanel, KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { useGreetingLabStage } from '../hooks/use-greeting-lab-stage';
import type { LabGreeting } from '../lab-greetings';
import { LAB_ORIGIN } from '../lab-greetings';
import { GreetingLabBoard } from './GreetingLabBoard';

interface GreetingLabPageProps {
  greeting: LabGreeting;
}

export const GreetingLabPage: FC<GreetingLabPageProps> = ({ greeting }) => {
  const stage = useGreetingLabStage(greeting);
  const board = <GreetingLabBoard key={stage.take} greeting={greeting} />;
  const facts = stage.facts.map((fact) => (
    <KkFactRow key={fact.label} title={fact.label} span={fact.value} />
  ));

  return (
    <KkScreen
      kind="detail"
      title={greeting.title}
      origin={LAB_ORIGIN}
      header={board}
      handover="confetti"
      action={stage.action}
    >
      <KkPanel>{facts}</KkPanel>
    </KkScreen>
  );
};
