import { useState } from 'react';
import { usePushAskQuery, usePushTopicsQuery } from '../api';
import { rememberPushAskAnswered } from '../push-ask-memory';

export type PushAskPhase = 'pending' | 'asking' | 'over';

export interface PushAskGateView {
  phase: PushAskPhase;
  finish: () => void;
}

export const usePushAskGate = (): PushAskGateView => {
  const ask = usePushAskQuery();
  const topics = usePushTopicsQuery(ask.data === true);
  const [phase, setPhase] = useState<PushAskPhase>('pending');
  const heard = topics.data?.topics.length;

  if (phase === 'pending' && (ask.data === false || ask.isError || topics.isError)) {
    setPhase('over');
  }
  if (phase === 'pending' && heard !== undefined) {
    setPhase(heard > 0 ? 'asking' : 'over');
  }

  const finish = (): void => {
    rememberPushAskAnswered();
    setPhase('over');
  };

  return { phase, finish };
};
