import { KkGreeting, KkLapClosing } from '@furria/ui';
import type { FC } from 'react';
import type { GreetingView } from '../greeting/greeting-view';

interface GreetingBoardProps {
  greeting: GreetingView;
}

export const GreetingBoard: FC<GreetingBoardProps> = ({ greeting }) => {
  const { lapClosing } = greeting;
  const line = greeting.line === null ? null : <KkGreeting.Line>{greeting.line}</KkGreeting.Line>;
  const visual =
    lapClosing === null ? undefined : (
      <KkLapClosing
        initials={lapClosing.initials}
        image={lapClosing.image}
        honours={lapClosing.honours}
        size="header"
      />
    );

  return (
    <KkGreeting
      key={greeting.key}
      play={greeting.play}
      festive={greeting.festive}
      burst={greeting.burst}
      follows={greeting.follows}
      visual={visual}
    >
      <KkGreeting.Headline
        parts={greeting.parts}
        deck={greeting.deck}
        nameDeck={greeting.nameDeck}
        tempo={greeting.tempo}
        countFrom={greeting.countFrom}
      />
      {line}
    </KkGreeting>
  );
};
