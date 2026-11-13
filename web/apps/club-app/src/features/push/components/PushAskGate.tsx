import type { FC, PropsWithChildren } from 'react';
import { usePushAskGate } from '../hooks/use-push-ask-gate';
import { PushAskScreen } from './PushAskScreen';

export const PushAskGate: FC<PropsWithChildren> = ({ children }) => {
  const { phase, finish } = usePushAskGate();
  if (phase === 'pending') {
    return null;
  }
  if (phase === 'asking') {
    return <PushAskScreen onNext={finish} />;
  }

  return children;
};
