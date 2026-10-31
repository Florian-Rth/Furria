import type { FC, PropsWithChildren } from 'react';
import { useWelcomeGate } from '../hooks/use-welcome-gate';
import { WelcomeStage } from './WelcomeStage';

export const WelcomeGate: FC<PropsWithChildren> = ({ children }) => {
  const { plan, phase, leave } = useWelcomeGate();
  const playing = plan !== null && phase === 'playing';
  const leaving = phase === 'leaving';
  const stage =
    plan !== null && phase !== 'over' ? (
      <WelcomeStage plan={plan} leaving={leaving} onLeave={leave} />
    ) : null;
  const app = playing ? null : children;

  return (
    <>
      {app}
      {stage}
    </>
  );
};
