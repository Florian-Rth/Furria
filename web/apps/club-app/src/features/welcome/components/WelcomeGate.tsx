import type { FC, PropsWithChildren } from 'react';
import { useWelcomeGate } from '../hooks/use-welcome-gate';
import { WelcomeConsentDialog } from './WelcomeConsentDialog';
import { WelcomeStage } from './WelcomeStage';

export const WelcomeGate: FC<PropsWithChildren> = ({ children }) => {
  const { plan, phase, asksConsent, leave } = useWelcomeGate();
  const playing = plan !== null && phase === 'playing';
  const leaving = phase === 'leaving';
  const stage =
    plan !== null && phase !== 'over' ? (
      <WelcomeStage plan={plan} leaving={leaving} onLeave={leave} />
    ) : null;
  const app = playing ? null : children;
  const isConsentAsked = asksConsent && phase === 'over';

  return (
    <>
      {app}
      {stage}
      <WelcomeConsentDialog isAsked={isConsentAsked} />
    </>
  );
};
