import type { KkGreetingBeat } from '@furria/ui';
import { KkCountHead, KkGreeting, KkGreetingSkeleton, KkLapClosing } from '@furria/ui';
import type { FC, ReactNode } from 'react';
import type { StartHeadView } from '../greeting/head-view';
import { StartCount } from './StartCount';
import { StartHeadFacts } from './StartHeadFacts';

const HEADLINE_SIZE = 'compact';
const RING_SIZE = 'large';
const LOCKUP_ALIGN = 'stretch';

interface StartHeadProps {
  view: StartHeadView | null;
  onPress?: () => void;
}

export const StartHead: FC<StartHeadProps> = ({ view, onPress }) => {
  if (view === null) {
    return (
      <KkCountHead>
        <KkGreetingSkeleton />
      </KkCountHead>
    );
  }

  const { greeting, split, lapClosing } = view;
  const count = (beat: KkGreetingBeat): ReactNode => (
    <StartCount split={split} beat={beat} onPress={onPress} />
  );
  const ring =
    lapClosing === null ? null : (
      <KkCountHead.Side>
        <KkLapClosing
          initials={lapClosing.initials}
          image={lapClosing.image}
          honours={lapClosing.honours}
          size={RING_SIZE}
        />
      </KkCountHead.Side>
    );

  return (
    <KkCountHead>
      <KkGreeting
        key={greeting.key}
        play={greeting.play}
        festive={greeting.festive}
        burst={greeting.burst}
        follows={greeting.follows}
        visual={count}
        align={LOCKUP_ALIGN}
      >
        <KkGreeting.Headline
          parts={split.sentence}
          deck={greeting.deck}
          nameDeck={greeting.nameDeck}
          tempo={greeting.tempo}
          countFrom={view.countFrom}
          size={HEADLINE_SIZE}
        />
        <StartHeadFacts line={view.line} badge={view.badge} facts={view.facts} />
      </KkGreeting>
      {ring}
    </KkCountHead>
  );
};
