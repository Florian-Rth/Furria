import { KkFactRow } from '@furria/ui/KkFactRow';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPosterBackdrop } from '@furria/ui/KkPosterBackdrop';
import { KkScreen } from '@furria/ui/KkScreen';
import type { FC } from 'react';
import { useGreetingLabStage } from '../hooks/use-greeting-lab-stage';
import type { LabGreeting } from '../lab-greetings';
import { LAB_ORIGIN } from '../lab-greetings';
import { GreetingLabHead } from './GreetingLabHead';

interface GreetingLabPageProps {
  greeting: LabGreeting;
}

export const GreetingLabPage: FC<GreetingLabPageProps> = ({ greeting }) => {
  const stage = useGreetingLabStage(greeting);
  const { look } = stage;
  const head = <GreetingLabHead key={stage.take} greeting={greeting} />;
  const facts = stage.facts.map((fact) => (
    <KkFactRow key={fact.label} title={fact.label} span={fact.value} />
  ));

  return (
    <KkPosterBackdrop
      key={stage.take}
      phase={look.phase}
      runUp={look.runUp}
      evening={look.evening}
      foil={look.foil}
    >
      <KkScreen
        kind="detail"
        title={greeting.title}
        origin={LAB_ORIGIN}
        header={head}
        handover="confetti"
        action={stage.action}
      >
        <KkPanel>{facts}</KkPanel>
      </KkScreen>
    </KkPosterBackdrop>
  );
};
