import type { KkGreetingPart } from '@furria/ui/flap-cells';
import type { KkGreetingPlay } from '@furria/ui/flap-schedule';
import type { KkHonours } from '@furria/ui/honour-types';
import type { KkImageSource } from '@furria/ui/image-source';
import type { GreetingAct } from './greeting-act';
import { toGreetingCopy } from './greeting-copy';
import { greetingPlayOf } from './greeting-play';
import type { GreetingStage } from './greeting-stage';
import { toGreetingStage } from './greeting-stage';

export interface GreetingHolder {
  initials: string;
  image: KkImageSource | null;
  honours: KkHonours;
}

export interface GreetingView extends GreetingStage {
  key: string;
  play: KkGreetingPlay;
  festive: boolean;
  burst: boolean;
  follows: boolean;
  parts: readonly KkGreetingPart[];
  line: string | null;
  lapClosing: GreetingHolder | null;
}

export interface GreetingViewRequest {
  act: GreetingAct;
  firstName: string;
  reducedMotion: boolean;
  follows: boolean;
  holder: GreetingHolder | null;
}

export const toGreetingView = ({
  act,
  firstName,
  reducedMotion,
  follows,
  holder,
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
    lapClosing: act.lapClose === null ? null : holder,
  };
};
