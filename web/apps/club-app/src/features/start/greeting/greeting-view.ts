import type { KkGreetingPart, KkGreetingPlay } from '@furria/ui';
import type { GreetingAct } from './greeting-act';
import { toGreetingCopy } from './greeting-copy';
import { greetingPlayOf } from './greeting-play';
import type { GreetingStage } from './greeting-stage';
import { toGreetingStage } from './greeting-stage';

export interface GreetingView extends GreetingStage {
  key: string;
  play: KkGreetingPlay;
  festive: boolean;
  burst: boolean;
  follows: boolean;
  parts: readonly KkGreetingPart[];
  line: string | null;
}

export interface GreetingViewRequest {
  act: GreetingAct;
  firstName: string;
  reducedMotion: boolean;
  follows: boolean;
}

export const toGreetingView = ({
  act,
  firstName,
  reducedMotion,
  follows,
}: GreetingViewRequest): GreetingView => {
  const copy = toGreetingCopy(act, firstName);
  const decision = greetingPlayOf(act, reducedMotion);

  return {
    ...toGreetingStage(act, copy),
    key: act.key,
    play: decision.play,
    festive: act.festive,
    burst: decision.burst,
    follows,
    parts: copy.parts,
    line: copy.line,
  };
};
