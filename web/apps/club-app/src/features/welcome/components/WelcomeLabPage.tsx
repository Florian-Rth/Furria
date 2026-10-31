import type { FC } from 'react';
import { useWelcomeLab } from '../hooks/use-welcome-lab';
import type { WelcomeLabCase } from '../welcome-lab';
import { WelcomeStage } from './WelcomeStage';

interface WelcomeLabPageProps {
  labCase: WelcomeLabCase;
}

export const WelcomeLabPage: FC<WelcomeLabPageProps> = ({ labCase }) => {
  const { plan, phase, leave } = useWelcomeLab(labCase);
  const leaving = phase === 'leaving';

  if (phase === 'over') {
    return null;
  }

  return <WelcomeStage plan={plan} leaving={leaving} onLeave={leave} />;
};
